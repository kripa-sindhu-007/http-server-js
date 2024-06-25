const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const url = request.split(" ")[1];
    if (url == "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (url.includes("/echo/")) {
      const content = url.split("/echo/")[1];
      const actualLength = Buffer.byteLength(content, "utf8");
      const headers = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${actualLength}\r\n\r\n`;
      socket.write(headers + content);
    } 
    else if(url.includes("/user-agent")){
      const cont = url.split("/user-agent/")[1];
      const length = Buffer.byteLength(cont, "utf8");
      const header = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${length}\r\n\r\n`;
      socket.write(header + cont);
    }
    else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
  });

  socket.on("close", () => {
    socket.end();
    socket.close();
  });
});

server.listen(4221, "localhost");
