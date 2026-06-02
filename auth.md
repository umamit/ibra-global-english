# auth.md - Agent Authentication & Registration - Ibra Global English

This page provides guidance for AI agents interacting with the Ibra Global English website and tools.

## Authentication Overview
All information on the Ibra Global English landing page is publicly accessible. 
- No API keys, OAuth tokens, or other forms of authorization are required to read program details.
- Exposed WebMCP browser tools (like `get_program_details` and `register_course`) do not require authentication.

## Course Registration
Student course registrations are processed by filling in the contact form at `https://ibraglobalenglish.com/#contact` and submitting it. This triggers a client-side redirect to the WhatsApp API to finalize the registration with our team. Agents can automate form filling using the `register_course` WebMCP tool exposed on page load.
