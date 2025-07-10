package com.prospektai.demo.config

import jakarta.servlet.Filter
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component

@Component
@Order(1)
class CorsFilter : Filter {
    
    override fun doFilter(request: ServletRequest, response: ServletResponse, chain: FilterChain) {
        val httpRequest = request as HttpServletRequest
        val httpResponse = response as HttpServletResponse
        
        // Add CORS headers to ALL responses (including 404s)
        httpResponse.setHeader("Access-Control-Allow-Origin", "*")
        httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        httpResponse.setHeader("Access-Control-Allow-Headers", "*")
        httpResponse.setHeader("Access-Control-Allow-Credentials", "true")
        httpResponse.setHeader("Access-Control-Max-Age", "3600")
        
        // Handle preflight OPTIONS requests
        if ("OPTIONS" == httpRequest.method) {
            httpResponse.status = HttpServletResponse.SC_OK
            return
        }
        
        chain.doFilter(request, response)
    }
}