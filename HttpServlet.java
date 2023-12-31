import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;

public class StockServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Your code to execute the Python script and retrieve stock data
        String symbol = request.getParameter("symbol");
        String year = request.getParameter("year");

        ProcessBuilder pb = new ProcessBuilder("python3", "fetch_data.py", symbol, year);
        Process process = pb.start();

        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String lastLine = "", line;
        while ((line = reader.readLine()) != null) {
            lastLine = line;
        }

        // New code to split the last line into two parts at the '{' character
        String[] parts = lastLine.split("\\{", 2);
        String stockDataJSON = "{" + parts[1];

        // Set response type and write the JSON data to the response
        response.setContentType("application/json");
        response.getWriter().write(stockDataJSON);
    }
}
