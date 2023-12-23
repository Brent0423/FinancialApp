import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import org.json.JSONObject;

public class Main {
    public static void main(String[] args) {
        try {
            String token = "pk_4dce35d553e644cdba95c55f314b1e1f";
            String symbol = "HSY";
            String urlString = "https://cloud.iexapis.com/stable/stock/" + symbol + "/quote?token=" + token;

            URI uri = new URI(urlString);
            URL url = uri.toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();

            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String line;
            StringBuilder response = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            reader.close();

            JSONObject json = new JSONObject(response.toString());
            double latestPrice = json.getDouble("latestPrice");

            System.out.println("The latest price of " + symbol + " is: " + latestPrice);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
