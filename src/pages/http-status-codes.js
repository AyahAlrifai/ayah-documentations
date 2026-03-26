import React, { useState, useMemo } from 'react';
import Layout from '@theme/Layout';
import { useColorMode } from '@docusaurus/theme-common';
import styles from '../css/style.module.css';

// ─── Status Code Data ────────────────────────────────────────────────────────

const STATUS_CODES = [
  // 1xx
  { code: 100, name: 'Continue', category: '1xx',
    description: 'The server has received the request headers and the client should proceed to send the request body. Used with large payloads where the client sends an Expect: 100-continue header first.',
    tags: ['upload', 'request body', 'Expect header'] },
  { code: 101, name: 'Switching Protocols', category: '1xx',
    description: 'The server agrees to switch protocols as requested by the client. Commonly used when upgrading an HTTP connection to a WebSocket connection.',
    tags: ['WebSocket', 'upgrade', 'real-time'] },
  { code: 102, name: 'Processing', category: '1xx',
    description: 'The server has received and is processing the request, but no response is available yet. Prevents the client from timing out on long-running operations.',
    tags: ['async', 'long-running', 'WebDAV'] },
  { code: 103, name: 'Early Hints', category: '1xx',
    description: 'Used to return response headers before the final HTTP message. Allows the browser to start preloading resources while the server prepares the full response.',
    tags: ['performance', 'preload', 'Link header'] },

  // 2xx
  { code: 200, name: 'OK', category: '2xx',
    description: 'The request succeeded. The meaning of the response depends on the HTTP method: GET returns the resource, POST returns the result of the action.',
    tags: ['success', 'GET', 'POST', 'REST'] },
  { code: 201, name: 'Created', category: '2xx',
    description: 'The request succeeded and a new resource was created. Typically returned after a POST or PUT request. The Location header often points to the new resource.',
    tags: ['created', 'POST', 'REST', 'Location header'] },
  { code: 202, name: 'Accepted', category: '2xx',
    description: 'The request has been accepted for processing, but the processing has not been completed. Used for asynchronous operations where the result will be available later.',
    tags: ['async', 'background job', 'queue'] },
  { code: 203, name: 'Non-Authoritative Information', category: '2xx',
    description: 'The returned metadata is not exactly the same as available from the origin server. Returned by a proxy that modified the response.',
    tags: ['proxy', 'cache', 'metadata'] },
  { code: 204, name: 'No Content', category: '2xx',
    description: 'The request succeeded but there is no content to return. Common for DELETE requests and PUT/PATCH responses where the client already has the updated data.',
    tags: ['DELETE', 'no body', 'REST'] },
  { code: 205, name: 'Reset Content', category: '2xx',
    description: 'The server successfully processed the request and asks the client to reset the document view. Used to clear a form after submission.',
    tags: ['form', 'reset', 'UI'] },
  { code: 206, name: 'Partial Content', category: '2xx',
    description: 'The server is delivering only part of the resource due to a range header sent by the client. Used for resumable downloads and video streaming.',
    tags: ['streaming', 'Range header', 'download', 'video'] },
  { code: 207, name: 'Multi-Status', category: '2xx',
    description: 'Provides status for multiple independent operations. Common in WebDAV responses where a single request affects multiple resources with different outcomes.',
    tags: ['WebDAV', 'batch', 'multi-resource'] },
  { code: 226, name: 'IM Used', category: '2xx',
    description: 'The server fulfilled a GET request for the resource and the response is a representation of the result of one or more instance-manipulations applied to the current instance.',
    tags: ['delta encoding', 'HTTP extensions', 'GET'] },

  // 3xx
  { code: 300, name: 'Multiple Choices', category: '3xx',
    description: 'The request has more than one possible response. The user-agent or user should choose one of them. Used when content negotiation finds multiple valid options.',
    tags: ['redirect', 'content negotiation', 'multiple'] },
  { code: 301, name: 'Moved Permanently', category: '3xx',
    description: 'The URL of the requested resource has been changed permanently. The new URL is given in the Location header. Search engines update their links to the resource.',
    tags: ['redirect', 'permanent', 'SEO', 'Location header'] },
  { code: 302, name: 'Found', category: '3xx',
    description: 'The URI of requested resource has been changed temporarily. The client should use the original URI for future requests. Often used after form submissions.',
    tags: ['redirect', 'temporary', 'POST-redirect-GET'] },
  { code: 303, name: 'See Other', category: '3xx',
    description: 'The response can be found under a different URI using the GET method. Used to redirect after a POST request to prevent duplicate submissions on refresh.',
    tags: ['redirect', 'POST-redirect-GET', 'form submission'] },
  { code: 304, name: 'Not Modified', category: '3xx',
    description: "The client's cached version is still valid and no new content needs to be sent. Returned when conditional request headers indicate the cache is fresh.",
    tags: ['caching', 'ETag', 'If-None-Match', 'If-Modified-Since'] },
  { code: 307, name: 'Temporary Redirect', category: '3xx',
    description: 'The request should be repeated with another URI, but future requests should still use the original URI. Unlike 302, the HTTP method must not change.',
    tags: ['redirect', 'temporary', 'method preserved'] },
  { code: 308, name: 'Permanent Redirect', category: '3xx',
    description: 'The resource is now permanently located at another URI. Unlike 301, the HTTP method must not change. Use this when permanently moving an API endpoint.',
    tags: ['redirect', 'permanent', 'method preserved', 'REST'] },

  // 4xx
  { code: 400, name: 'Bad Request', category: '4xx',
    description: 'The server cannot process the request due to client-side syntax errors, invalid parameters, or malformed request body. The client should fix the request before retrying.',
    tags: ['validation', 'syntax error', 'malformed', 'Spring Boot'] },
  { code: 401, name: 'Unauthorized', category: '4xx',
    description: "Authentication is required and has failed or has not yet been provided. Despite the name, it's about authentication not authorization. The client must send valid credentials.",
    tags: ['auth', 'JWT', 'Bearer token', 'authentication', 'Spring Security'] },
  { code: 402, name: 'Payment Required', category: '4xx',
    description: 'Reserved for future use, but commonly used by APIs to indicate the user needs to pay or upgrade their plan. Not standardized but widely adopted.',
    tags: ['payment', 'subscription', 'plan limit', 'billing'] },
  { code: 403, name: 'Forbidden', category: '4xx',
    description: "The server understood the request but refuses to authorize it. The client's identity is known but they lack the required permissions. Different from 401.",
    tags: ['auth', 'authorization', 'permissions', 'roles', 'Spring Security', 'RBAC'] },
  { code: 404, name: 'Not Found', category: '4xx',
    description: 'The server cannot find the requested resource. The URL is valid but the resource does not exist — it may have been deleted, moved, or never existed.',
    tags: ['missing', 'not found', 'REST', 'resource'] },
  { code: 405, name: 'Method Not Allowed', category: '4xx',
    description: 'The HTTP method used is not supported for the requested resource. For example, sending a DELETE request to a read-only endpoint. The Allow header lists valid methods.',
    tags: ['HTTP method', 'REST', 'Allow header', 'Spring Boot'] },
  { code: 406, name: 'Not Acceptable', category: '4xx',
    description: "The server cannot produce a response that matches the list of acceptable values defined in the request's Accept headers. Used during content negotiation.",
    tags: ['content negotiation', 'Accept header', 'media type'] },
  { code: 407, name: 'Proxy Authentication Required', category: '4xx',
    description: 'The client must first authenticate itself with the proxy server before the request can be forwarded. Similar to 401 but for proxy servers.',
    tags: ['proxy', 'auth', 'authentication'] },
  { code: 408, name: 'Request Timeout', category: '4xx',
    description: 'The server timed out waiting for the request. The client did not produce a request within the time the server was prepared to wait. The connection may be reused.',
    tags: ['timeout', 'connection', 'slow client'] },
  { code: 409, name: 'Conflict', category: '4xx',
    description: 'The request conflicts with the current state of the target resource. Common when trying to create a resource that already exists or when concurrent updates conflict.',
    tags: ['conflict', 'duplicate', 'concurrent update', 'optimistic locking'] },
  { code: 410, name: 'Gone', category: '4xx',
    description: 'The target resource is no longer available and will not be available again. Unlike 404, the resource used to exist but has been intentionally removed.',
    tags: ['deleted', 'removed', 'permanent', 'SEO'] },
  { code: 411, name: 'Length Required', category: '4xx',
    description: 'The server refuses to accept the request without a defined Content-Length header. The client must send the size of the request body.',
    tags: ['Content-Length', 'header', 'request body'] },
  { code: 412, name: 'Precondition Failed', category: '4xx',
    description: 'One or more conditions in the request headers evaluated to false when tested on the server. Used with conditional requests for optimistic concurrency control.',
    tags: ['conditional', 'ETag', 'If-Match', 'optimistic locking'] },
  { code: 413, name: 'Content Too Large', category: '4xx',
    description: 'The request entity is larger than limits defined by the server. Commonly triggered by large file uploads. The server may return a Retry-After header.',
    tags: ['file upload', 'size limit', 'multipart', 'Spring Boot'] },
  { code: 414, name: 'URI Too Long', category: '4xx',
    description: 'The URI requested by the client is longer than the server is willing to interpret. Usually caused by encoding too much data into a GET query string.',
    tags: ['URL', 'query string', 'GET', 'limit'] },
  { code: 415, name: 'Unsupported Media Type', category: '4xx',
    description: "The media format of the requested data is not supported by the server. Often occurs when the Content-Type header doesn't match what the endpoint expects.",
    tags: ['Content-Type', 'media type', 'JSON', 'XML', 'Spring Boot'] },
  { code: 416, name: 'Range Not Satisfiable', category: '4xx',
    description: 'The range specified in the Range header cannot be fulfilled. The range is outside the bounds of the resource.',
    tags: ['Range header', 'streaming', 'partial content', 'download'] },
  { code: 417, name: 'Expectation Failed', category: '4xx',
    description: "The expectation indicated in the Expect request-header field could not be met by the server. Commonly returned when the server doesn't support Expect: 100-continue.",
    tags: ['Expect header', '100-continue', 'request body'] },
  { code: 418, name: "I'm a Teapot", category: '4xx',
    description: "Any attempt to brew coffee with a teapot should result in this error code. An April Fools' joke from RFC 2324 (1998). Sometimes used as an easter egg or to reject invalid requests.",
    tags: ['easter egg', 'RFC 2324', 'HTCPCP', 'fun'] },
  { code: 421, name: 'Misdirected Request', category: '4xx',
    description: "The request was directed at a server that is not able to produce a response for the requested URI. Can occur with HTTP/2 connection reuse.",
    tags: ['HTTP/2', 'TLS', 'virtual hosting', 'connection reuse'] },
  { code: 422, name: 'Unprocessable Entity', category: '4xx',
    description: 'The server understands the content type and the syntax is correct, but it was unable to process the contained instructions due to semantic errors. Used for bean validation failures.',
    tags: ['validation', 'semantic error', 'Spring Boot', 'Bean Validation'] },
  { code: 423, name: 'Locked', category: '4xx',
    description: 'The resource that is being accessed is locked. Used in WebDAV to prevent concurrent modifications when a resource is checked out for editing.',
    tags: ['WebDAV', 'locking', 'concurrency', 'exclusive access'] },
  { code: 424, name: 'Failed Dependency', category: '4xx',
    description: 'The method could not be performed on the resource because the requested action depended on another action and that action failed.',
    tags: ['WebDAV', 'dependency', 'batch', 'multi-status'] },
  { code: 425, name: 'Too Early', category: '4xx',
    description: 'The server is unwilling to risk processing a request that might be replayed. Used with TLS 1.3 Early Data (0-RTT) to prevent replay attacks.',
    tags: ['TLS 1.3', '0-RTT', 'replay attack', 'security'] },
  { code: 426, name: 'Upgrade Required', category: '4xx',
    description: 'The server refuses to perform the request using the current protocol but will accept it after the client upgrades. The Upgrade header specifies the required protocol.',
    tags: ['Upgrade header', 'TLS', 'protocol upgrade', 'WebSocket'] },
  { code: 428, name: 'Precondition Required', category: '4xx',
    description: 'The origin server requires the request to be conditional to prevent the "lost update" problem. The client must include conditional headers like If-Match.',
    tags: ['conditional request', 'If-Match', 'ETag', 'lost update'] },
  { code: 429, name: 'Too Many Requests', category: '4xx',
    description: 'The user has sent too many requests in a given amount of time. The response may include a Retry-After header. Common in APIs with rate limiting.',
    tags: ['rate limit', 'throttling', 'Retry-After', 'API', 'Spring Boot'] },
  { code: 431, name: 'Request Header Fields Too Large', category: '4xx',
    description: "The server refuses to process the request because the request's HTTP headers are too large. Can occur with very large cookies or many custom headers.",
    tags: ['headers', 'cookies', 'size limit'] },
  { code: 451, name: 'Unavailable For Legal Reasons', category: '4xx',
    description: 'The server is denying access to the resource as a consequence of a legal demand. Named after the Ray Bradbury novel Fahrenheit 451.',
    tags: ['legal', 'DMCA', 'censorship', 'compliance'] },

  // 5xx
  { code: 500, name: 'Internal Server Error', category: '5xx',
    description: 'A generic error indicating an unexpected condition was encountered and no more specific message is suitable. Usually indicates a bug, uncaught exception, or misconfiguration on the server.',
    tags: ['server error', 'exception', 'bug', 'Spring Boot'] },
  { code: 501, name: 'Not Implemented', category: '5xx',
    description: 'The server does not support the functionality required to fulfill the request. Used when the server does not recognize the HTTP method or lacks the ability to fulfill the request.',
    tags: ['not supported', 'future feature', 'HTTP method'] },
  { code: 502, name: 'Bad Gateway', category: '5xx',
    description: 'The server, while acting as a gateway or proxy, received an invalid response from an inbound server. Commonly seen when Nginx or an API Gateway cannot reach the upstream service.',
    tags: ['proxy', 'gateway', 'Nginx', 'upstream', 'microservices'] },
  { code: 503, name: 'Service Unavailable', category: '5xx',
    description: 'The server is not ready to handle the request. Common causes are the server being down for maintenance or being overloaded. A Retry-After header may indicate recovery time.',
    tags: ['maintenance', 'overload', 'health check', 'Retry-After', 'circuit breaker'] },
  { code: 504, name: 'Gateway Timeout', category: '5xx',
    description: 'The server, while acting as a gateway or proxy, did not get a response in time from an upstream server. Different from 408 — this is the proxy timing out.',
    tags: ['timeout', 'proxy', 'gateway', 'upstream', 'microservices'] },
  { code: 505, name: 'HTTP Version Not Supported', category: '5xx',
    description: 'The HTTP version used in the request is not supported by the server. Rarely seen in practice as most servers support HTTP/1.1 and HTTP/2.',
    tags: ['HTTP version', 'HTTP/2', 'protocol'] },
  { code: 506, name: 'Variant Also Negotiates', category: '5xx',
    description: 'The server has an internal configuration error: the chosen variant resource is configured to engage in transparent content negotiation itself.',
    tags: ['content negotiation', 'configuration', 'TCN'] },
  { code: 507, name: 'Insufficient Storage', category: '5xx',
    description: 'The method could not be performed because the server is unable to store the representation needed to complete the request. Used in WebDAV when disk space is full.',
    tags: ['WebDAV', 'storage', 'disk space', 'file upload'] },
  { code: 508, name: 'Loop Detected', category: '5xx',
    description: 'The server detected an infinite loop while processing the request. Used in WebDAV when processing a request with Depth: infinity causes a circular reference.',
    tags: ['WebDAV', 'infinite loop', 'circular reference'] },
  { code: 510, name: 'Not Extended', category: '5xx',
    description: 'Further extensions to the request are required for the server to fulfil it. The server should send back the required extensions in the response body.',
    tags: ['extension', 'HTTP extensions', 'policy'] },
  { code: 511, name: 'Network Authentication Required', category: '5xx',
    description: 'The client needs to authenticate to gain network access. Used by captive portals (hotel Wi-Fi, airport logins) to intercept requests and redirect to a login page.',
    tags: ['captive portal', 'Wi-Fi', 'network auth', 'login'] },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_CATEGORIES = ['All', '1xx', '2xx', '3xx', '4xx', '5xx'];

const CATEGORY_COLORS = {
  '1xx': { bg: 'rgba(82,141,255,0.12)',  text: '#0859fc',  border: 'rgba(82,141,255,0.28)',  label: 'Informational' },
  '2xx': { bg: 'rgba(34,197,94,0.12)',   text: '#16a34a',  border: 'rgba(34,197,94,0.28)',   label: 'Success'       },
  '3xx': { bg: 'rgba(245,158,11,0.12)',  text: '#d97706',  border: 'rgba(245,158,11,0.28)',  label: 'Redirection'   },
  '4xx': { bg: 'rgba(239,68,68,0.12)',   text: '#dc2626',  border: 'rgba(239,68,68,0.28)',   label: 'Client Error'  },
  '5xx': { bg: 'rgba(236,72,153,0.12)',  text: '#be185d',  border: 'rgba(236,72,153,0.28)',  label: 'Server Error'  },
};

const CATEGORY_COLORS_DARK = {
  '1xx': { bg: 'rgba(82,141,255,0.14)',  text: '#93b4ff',  border: 'rgba(82,141,255,0.3)',   label: 'Informational' },
  '2xx': { bg: 'rgba(74,222,128,0.12)',  text: '#4ade80',  border: 'rgba(74,222,128,0.28)',  label: 'Success'       },
  '3xx': { bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24',  border: 'rgba(251,191,36,0.28)',  label: 'Redirection'   },
  '4xx': { bg: 'rgba(248,113,113,0.12)', text: '#f87171',  border: 'rgba(248,113,113,0.28)', label: 'Client Error'  },
  '5xx': { bg: 'rgba(244,114,182,0.12)', text: '#f472b6',  border: 'rgba(244,114,182,0.28)', label: 'Server Error'  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function CategoryTag({ category, isDark }) {
  const palette = isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS;
  const c = palette[category] || { bg: '#eee', text: '#333', border: '#ccc' };
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '0.7rem', fontWeight: 700,
      letterSpacing: '0.09em', textTransform: 'uppercase',
      padding: '0.22rem 0.65rem', borderRadius: '50px',
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      {category} {c.label}
    </span>
  );
}

function StatusCodeCard({ item, isDark }) {
  const palette  = isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS;
  const c        = palette[item.category];

  const cardBg     = isDark ? '#161b22' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const cardShadow = isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)';
  const descColor  = isDark ? 'rgba(255,255,255,0.62)' : '#4b5563';
  const tagBg      = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const tagBorder  = isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.08)';
  const tagColor   = isDark ? 'rgba(255,255,255,0.5)'  : '#6b7280';

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '16px',
        padding: '1.35rem 1.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.85rem',
        boxShadow: cardShadow,
        transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isDark ? '0 16px 40px rgba(0,0,0,0.45)' : '0 16px 40px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = isDark ? 'rgba(82,141,255,0.3)' : 'rgba(8,89,252,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = cardShadow;
        e.currentTarget.style.borderColor = cardBorder;
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: "'Consolas', 'Courier New', monospace",
            fontSize: '1rem', fontWeight: 700,
            padding: '0.28rem 0.72rem', borderRadius: '8px',
            background: c.bg, color: c.text, border: `1px solid ${c.border}`,
            letterSpacing: '0.01em', lineHeight: 1.4,
          }}>
            {item.code}
          </span>
          <span style={{
            fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.35,
            color: isDark ? 'rgba(255,255,255,0.88)' : '#1f2937',
          }}>
            {item.name}
          </span>
        </div>
        <CategoryTag category={item.category} isDark={isDark} />
      </div>

      {/* Description */}
      <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7, color: descColor }}>
        {item.description}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {item.tags.map(tag => (
          <span key={tag} style={{
            fontSize: '0.72rem', fontWeight: 500,
            padding: '0.2rem 0.6rem', borderRadius: '50px',
            background: tagBg, color: tagColor, border: `1px solid ${tagBorder}`,
          }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function HttpStatusCodesContent() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const [query, setQuery]               = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STATUS_CODES.filter((s) => {
      const catMatch = activeCategory === 'All' || s.category === activeCategory;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        String(s.code).includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [query, activeCategory]);

  // ── Design tokens (identical to spring-boot-annotations) ──
  const pageBg    = isDark ? '#0d1117'  : '#f0f4fb';
  const toolbarBg = isDark ? '#161b22'  : '#ffffff';
  const toolbarBor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const titleColor = isDark ? 'rgba(255,255,255,0.88)' : '#1f2937';
  const inputBg   = isDark ? 'rgba(255,255,255,0.05)' : '#f4f7ff';
  const inputBor  = isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.1)';
  const inputColor = isDark ? 'rgba(255,255,255,0.82)' : '#1f2937';
  const tabInactiveBg    = isDark ? 'rgba(255,255,255,0.05)' : '#f4f7ff';
  const tabInactiveColor = isDark ? 'rgba(255,255,255,0.55)' : '#6b7280';
  const tabInactiveBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const emptyColor = isDark ? 'rgba(255,255,255,0.28)' : '#9ca3af';
  const countColor = isDark ? 'rgba(255,255,255,0.38)' : '#9ca3af';

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      background: pageBg,
      padding: 'clamp(0.75rem, 3vw, 1.75rem) clamp(0.75rem, 4vw, 1.75rem) 3rem',
      display: 'flex', flexDirection: 'column', gap: '1.25rem',
    }}>

      {/* ── Toolbar ── */}
      <div
        className={styles.toolBar}
        style={{ background: toolbarBg, border: `1px solid ${toolbarBor}`, flexWrap: 'wrap', rowGap: '0.6rem' }}
      >
        {/* Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginRight: 'auto' }}>
          <span style={{ fontSize: '1.15rem' }}>🌐</span>
          <span className={styles.toolBarTitle} style={{ color: titleColor, fontSize: '1rem' }}>
            HTTP Status Codes
          </span>
          <span style={{
            fontSize: '0.72rem', fontWeight: 700,
            padding: '0.18rem 0.55rem', borderRadius: '50px',
            background: isDark ? 'rgba(82,141,255,0.14)' : 'rgba(8,89,252,0.08)',
            color: isDark ? '#93b4ff' : '#0859fc',
            border: isDark ? '1px solid rgba(82,141,255,0.25)' : '1px solid rgba(8,89,252,0.18)',
            letterSpacing: '0.05em',
          }}>
            {STATUS_CODES.length} codes
          </span>
        </div>

        <div className={styles.toolBarDivider} />

        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{
            position: 'absolute', left: '0.75rem',
            color: isDark ? 'rgba(255,255,255,0.3)' : '#9ca3af',
            fontSize: '0.9rem', pointerEvents: 'none', lineHeight: 1,
          }}>⌕</span>
          <input
            type="text"
            placeholder="Search codes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              padding: '0.42rem 0.85rem 0.42rem 2rem',
              borderRadius: '8px', border: `1px solid ${inputBor}`,
              background: inputBg, color: inputColor,
              fontSize: '0.875rem', outline: 'none', width: 'clamp(140px, 30vw, 220px)',
              transition: 'border-color 0.2s ease', fontFamily: 'inherit',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#528dff'; }}
            onBlur={(e) => { e.target.style.borderColor = inputBor; }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute', right: '0.5rem',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af',
                fontSize: '0.85rem', lineHeight: 1, padding: '0.15rem',
              }}
              title="Clear search"
            >✕</button>
          )}
        </div>

        <div className={styles.toolBarDivider} />

        {/* Result count */}
        <span className={styles.toolBarMeta} style={{ color: countColor }}>
          {filtered.length} / {STATUS_CODES.length} shown
        </span>
      </div>

      {/* ── Category Tabs ── */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {ALL_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          const palette = isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS;
          const cp = palette[cat];

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.38rem 1.05rem', borderRadius: '50px',
                fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer',
                border: `1px solid ${isActive ? 'transparent' : (cp ? cp.border : tabInactiveBorder)}`,
                background: isActive ? (cp ? cp.bg : 'linear-gradient(135deg, #528dff 0%, #0859fc 100%)') : tabInactiveBg,
                color: isActive ? (cp ? cp.text : '#fff') : tabInactiveColor,
                boxShadow: isActive && !cp ? '0 2px 10px rgba(82,141,255,0.3)' : 'none',
                transition: 'all 0.18s ease', lineHeight: 1.4,
                outline: 'none', fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = cp ? cp.border : 'rgba(82,141,255,0.35)';
                  e.currentTarget.style.color = cp ? cp.text : (isDark ? 'rgba(255,255,255,0.88)' : '#374151');
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = cp ? cp.border : tabInactiveBorder;
                  e.currentTarget.style.color = tabInactiveColor;
                }
              }}
            >
              {cat}
              {cat !== 'All' && (
                <span style={{ marginLeft: '0.35rem', fontSize: '0.72rem', opacity: 0.75 }}>
                  {STATUS_CODES.filter(s => s.category === cat).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Grid / Empty state ── */}
      {filtered.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '5rem 2rem', gap: '0.85rem',
          color: emptyColor, textAlign: 'center',
        }}>
          <span style={{ fontSize: '2.8rem', opacity: 0.45 }}>🔍</span>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
            No codes match "{query}"
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>
            Try a different search term or clear the filter.
          </p>
          <button
            onClick={() => { setQuery(''); setActiveCategory('All'); }}
            style={{
              marginTop: '0.5rem', padding: '0.45rem 1.2rem',
              borderRadius: '8px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
              background: 'transparent',
              color: isDark ? 'rgba(255,255,255,0.6)' : '#6b7280',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit',
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
          gap: '1.1rem',
        }}>
          {filtered.map((item) => (
            <StatusCodeCard key={item.code} item={item} isDark={isDark} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HttpStatusCodes() {
  return (
    <Layout title="HTTP Status Codes" description="Quick reference for all 60 standard HTTP response codes — searchable and filterable.">
      <HttpStatusCodesContent />
    </Layout>
  );
}
