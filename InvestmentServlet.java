package src.main.java;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;
import com.google.gson.Gson;

public class InvestmentServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        // Get the stock symbol and year from the request parameters
        String symbol = request.getParameter("symbol");
        String year = request.getParameter("year");

        // Call your Python script and get the output
        ProcessBuilder pb = new ProcessBuilder("python3", "fetch_data.py", symbol, year);
        Process process = pb.start();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String output = reader.readLine();

        // Convert the output to JSON
        Gson gson = new Gson();
        String json = gson.toJson(output);

        // Send the JSON as the response
        out.println(json);
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Handle POST request here
    }
}
