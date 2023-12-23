import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;
import com.google.gson.Gson;

public class InvestmentServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("Hello from InvestmentServlet");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Handle POST request here

        BufferedReader reader = request.getReader();
        StringBuilder builder = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            builder.append(line);
        }
        String data = builder.toString();

        Gson gson = new Gson();
        InvestmentData investmentData = gson.fromJson(data, InvestmentData.class);

        // Use investmentData here
        // Perform your calculations here. For example:
        double investmentReturn = calculateInvestmentReturn(investmentData);

        // Then, you can include the result in the response data.
    }

    private double calculateInvestmentReturn(InvestmentData investmentData) {
        // Replace this with your actual calculation.
        return investmentData.getInvestmentAmount() * 1.05;
    }

    public class InvestmentData {
        private String stockSymbol;
        private double investmentAmount;

        // getters and setters
        public String getStockSymbol() {
            return stockSymbol;
        }

        public void setStockSymbol(String stockSymbol) {
            this.stockSymbol = stockSymbol;
        }

        public double getInvestmentAmount() {
            return investmentAmount;
        }

        public void setInvestmentAmount(double investmentAmount) {
            this.investmentAmount = investmentAmount;
        }
    }
}
