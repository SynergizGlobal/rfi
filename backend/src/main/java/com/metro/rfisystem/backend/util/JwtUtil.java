package com.metro.rfisystem.backend.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;

import javax.crypto.SecretKey;
import java.util.Date;

public class JwtUtil {

    private static final SecretKey key =
            Keys.hmacShaKeyFor("SuperSecre454tKey1234567890SuperSecretKey1234".getBytes());

    private static final long EXPIRATION = 1000 * 60 * 60; 

    public static String generateToken(String userId) {
        return Jwts.builder()
                .setSubject(userId)
                .setIssuer("rfi-system")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public static String validateToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.getSubject();

        } catch (JwtException e) {
            return null;
        }
    }
}
