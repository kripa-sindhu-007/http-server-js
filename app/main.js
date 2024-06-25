const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const url = request.split(" ")[1];
    const header=request.split('\r\n');
    if (url == "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (url.includes("/echo/")) {
      const content = url.split("/echo/")[1];
      const actualLength = Buffer.byteLength(content, "utf8");
      const temp = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${actualLength}\r\n\r\n`;
      socket.write(temp + content);
    } 
    else if(url.includes("/user-agent")){
      const userAgent=header[2].split('User-Agent: ')[1];
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`);
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
