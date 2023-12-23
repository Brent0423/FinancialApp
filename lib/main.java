import yahoofinance.YahooFinance;
import yahoofinance.Stock;

public class main {
    public static void main(String[] args) {
        try {
            // Fetch data for a specific stock
            Stock stock = YahooFinance.get("INTC");

            // Check if the stock data is null
            if (stock != null) {
                System.out.println("API is connected correctly.");
                System.out.println("Stock: " + stock.getName());
            } else {
                System.out.println("Failed to connect to the API.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
