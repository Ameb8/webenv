package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

var secretKey = []byte(getEnv("JWT_SECRET", "your-secret-key"))

func main() {
	http.HandleFunc("/validate", validateHandler)

	port := getEnv("PORT", "8000")
	log.Printf("Starting auth service on :%s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func validateHandler(w http.ResponseWriter, r *http.Request) {
	auth := r.Header.Get("Authorization")
	if !strings.HasPrefix(auth, "Bearer ") {
		http.Error(w, "Missing token", http.StatusUnauthorized)
		return
	}

	tokenStr := strings.TrimPrefix(auth, "Bearer ")

	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return secretKey, nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	// Get "sub" from token claims (optional)
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		user := claims["sub"]
		w.Header().Set("X-Auth-User", fmt.Sprint(user))
		w.WriteHeader(http.StatusOK)
		return
	}

	http.Error(w, "Unauthorized", http.StatusUnauthorized)
}

func getEnv(key, fallback string) string {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	return val
}
