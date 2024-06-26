const net = require("net");
const fs = require("fs");
const zlib = require("zlib");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const url = request.split(" ")[1];
    const header = request.split("\r\n");
    const method = request.split(" ")[0];
    if (url == "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (url.includes("/echo/")) {
      const content = url.split("/echo/")[1].trim();
      const acceptEncodingHeaderRegex = /Accept-Encoding:\s.*\r\n/g;
      const acceptEncodingMatch = acceptEncodingHeaderRegex.exec(request);
      const acceptedEncoding = acceptEncodingMatch?.[0]
        .split(":")[1]
        .trim()
        .split(",")
        .map((e) => e.trim());
      console.log(acceptedEncoding);
      if (acceptedEncoding?.includes("gzip")) {
        if (content) {
          const body = zlib.gzipSync(content);
          socket.write(
            `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${body.length}\r\nContent-Encoding: gzip\r\n\r\n`
          );
          socket.write(body);
        } else {
          socket.write(
            `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\nContent-Encoding: gzip\r\n\r\n${content}`
          );
        }
      } else {
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`
        );
      }
      // const actualLength = Buffer.byteLength(content, "utf8");
      // const temp = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${actualLength}\r\n\r\n`;
      // socket.write(temp + content);
    } else if (url.startsWith("/files/") && method === "GET") {
      const directory = process.argv[3];
      const filename = url.split("/files/")[1];
      if (fs.existsSync(`${directory}/${filename}`)) {
        const content = fs.readFileSync(`${directory}/${filename}`).toString();
        const res = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}\r\n`;
        socket.write(res);
      } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      }
    } else if (url.startsWith("/files/") && method === "POST") {
      const directory = process.argv[3];
      const filename = url.split("/files/")[1];
      const req = data.toString().split("\r\n");
      const body = req[req.length - 1];
      fs.writeFileSync(`${directory}/${filename}`, body);
      socket.write(`HTTP/1.1 201 Created\r\n\r\n`);
    } else if (url.includes("/user-agent")) {
      const userAgent = header[2].split("User-Agent: ")[1];
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`
      );
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
