package com.projectboard.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectboard.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final byte[] secretKey;
    private final long expirationMinutes;

    public JwtService(@Value("${projectboard.jwt.secret}") String secret,
                      @Value("${projectboard.jwt.expiration-minutes:1440}") long expirationMinutes) {
        this.secretKey = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationMinutes = expirationMinutes;
    }

    public String generateToken(User user) {
        long now = Instant.now().getEpochSecond();
        long exp = now + (expirationMinutes * 60);

        Map<String, Object> payload = new HashMap<>();
        payload.put("sub", user.getEmail());
        payload.put("uid", user.getId());
        payload.put("username", user.getUsername());
        payload.put("iat", now);
        payload.put("exp", exp);

        try {
            String header = base64Url(MAPPER.writeValueAsBytes(Map.of("alg", "HS256", "typ", "JWT")));
            String body = base64Url(MAPPER.writeValueAsBytes(payload));
            String signature = sign(header + "." + body);
            return header + "." + body + "." + signature;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to create token", ex);
        }
    }

    public AuthenticatedUser parseToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
            }

            String unsigned = parts[0] + "." + parts[1];
            if (!constantTimeEquals(sign(unsigned), parts[2])) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token signature");
            }

            Map<String, Object> claims = MAPPER.readValue(
                    Base64.getUrlDecoder().decode(parts[1]),
                    new TypeReference<>() {
                    }
            );

            long exp = asLong(claims.get("exp"));
            long now = Instant.now().getEpochSecond();
            if (now >= exp) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token expired");
            }

            return new AuthenticatedUser(
                    asLong(claims.get("uid")),
                    stringValue(claims.get("sub")),
                    stringValue(claims.get("username"))
            );
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token", ex);
        }
    }

    private String sign(String value) throws Exception {
        Mac mac = Mac.getInstance(HMAC_ALGORITHM);
        mac.init(new SecretKeySpec(secretKey, HMAC_ALGORITHM));
        return base64Url(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
    }

    private boolean constantTimeEquals(String left, String right) {
        byte[] leftBytes = left.getBytes(StandardCharsets.UTF_8);
        byte[] rightBytes = right.getBytes(StandardCharsets.UTF_8);
        if (leftBytes.length != rightBytes.length) {
            return false;
        }
        int result = 0;
        for (int index = 0; index < leftBytes.length; index++) {
            result |= leftBytes[index] ^ rightBytes[index];
        }
        return result == 0;
    }

    private String base64Url(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private long asLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
    }

    private String stringValue(Object value) {
        if (value == null) {
            return null;
        }
        return String.valueOf(value);
    }
}
