require 'webrick'

# Custom WEBrick HTTP Server to support agent-readiness headers and markdown negotiation
class AgentReadyServer < WEBrick::HTTPServlet::FileHandler
  def do_GET(req, res)
    path = req.path
    is_home = (path == '/' || path == '/index.html')
    
    # 1. Add Link response headers for agent discovery on the homepage
    if is_home
      res['Link'] = [
        '</.well-known/api-catalog>; rel="api-catalog"',
        '</.well-known/agent-skills/index.json>; rel="agent-skills"',
        '</.well-known/mcp/server-card.json>; rel="mcp-server-card"'
      ].join(', ')
      
      # 2. Markdown Negotiation: Check if agent accepts markdown
      accept_header = req['Accept'] || ''
      if accept_header.include?('text/markdown')
        md_file_path = File.join(@config[:DocumentRoot], 'index.md')
        if File.exist?(md_file_path)
          md_content = File.read(md_file_path)
          res.body = md_content
          res.status = 200
          res['Content-Type'] = 'text/markdown; charset=utf-8'
          # Estimate tokens: ~4 chars per token
          res['x-markdown-tokens'] = (md_content.size / 4.0).ceil.to_s
          return
        end
      end
    end
    
    # Ensure correct content types for well-known json files and auth endpoints
    if path.include?('.well-known') && (path.end_with?('.json') || path.include?('openid-configuration') || path.include?('oauth-protected-resource'))
      super(req, res)
      res['Content-Type'] = 'application/json; charset=utf-8'
      return
    elsif path == '/.well-known/api-catalog'
      # Serve api-catalog as application/linkset+json
      catalog_path = File.join(@config[:DocumentRoot], '.well-known', 'api-catalog')
      if File.exist?(catalog_path)
        res.body = File.read(catalog_path)
        res.status = 200
        res['Content-Type'] = 'application/linkset+json; charset=utf-8'
        return
      end
    end
    
    super(req, res)
  end
end

# Set up server on port 8000
server = WEBrick::HTTPServer.new(Port: 8000, DocumentRoot: Dir.pwd)
server.mount('/', AgentReadyServer, Dir.pwd)

trap('INT') { server.shutdown }
server.start
