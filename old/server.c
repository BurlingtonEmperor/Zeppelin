#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib, "ws2_32.lib")

#define PORT 8080
#define BUFFER_SIZE 4096

// --- Helper: Determine MIME type based on file extension ---
const char *get_mime_type(const char *path) {
    const char *ext = strrchr(path, '.');
    if (!ext) return "application/octet-stream";
    if (strcmp(ext, ".html") == 0) return "text/html";
    if (strcmp(ext, ".css")  == 0) return "text/css";
    if (strcmp(ext, ".js")   == 0) return "application/javascript";
    if (strcmp(ext, ".png")  == 0) return "image/png";
    if (strcmp(ext, ".jpg")  == 0) return "image/jpeg";
    if (strcmp(ext, ".gif")  == 0) return "image/gif";
    return "text/plain";
}

// --- Helper: Send a file to the client in chunks ---
void serve_file(int client_fd, const char *path) {
    // Skip the leading '/' if present
    const char *filename = (path[0] == '/') ? path + 1 : path;
    if (strlen(filename) == 0) filename = "index.html";

    FILE *f = fopen(filename, "rb"); // Open in binary mode
    if (!f) {
        char *not_found = "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n";
        send(client_fd, not_found, strlen(not_found), 0);
        printf("404 Not Found: %s\n", filename);
        return;
    }

    // 1. Send HTTP Header
    char header[512];
    sprintf(header, "HTTP/1.1 200 OK\r\nContent-Type: %s\r\nConnection: close\r\n\r\n", get_mime_type(filename));
    send(client_fd, header, strlen(header), 0);

    // 2. Stream File Content
    unsigned char buffer[BUFFER_SIZE];
    size_t bytes_read;
    while ((bytes_read = fread(buffer, 1, sizeof(buffer), f)) > 0) {
        send(client_fd, buffer, bytes_read, 0);
    }

    printf("200 OK: %s\n", filename);
    fclose(f);
}

int main() {
    int server_fd, client_fd;
    struct sockaddr_in address;
    int addrlen = sizeof(address);

    // Create socket
    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    
    // Set socket options to reuse the port immediately after closing
    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);

    // Bind and Listen
    bind(server_fd, (struct sockaddr *)&address, sizeof(address));
    listen(server_fd, 10);

    printf("Server started on http://localhost:%d\n", PORT);

    while (1) {
        client_fd = accept(server_fd, (struct sockaddr *)&address, (socklen_t*)&addrlen);
        
        char request_buffer[BUFFER_SIZE] = {0};
        read(client_fd, request_buffer, BUFFER_SIZE);

        // Simple parsing: Extract path from "GET /path/to/file HTTP/1.1"
        char method[10], path[256];
        sscanf(request_buffer, "%s %s", method, path);

        serve_file(client_fd, path);
        close(client_fd);
    }

    return 0;
}