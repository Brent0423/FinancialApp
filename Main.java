import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) throws IOException {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter stock symbol: ");
        String symbol = scanner.nextLine();

        System.out.print("Enter year: ");
        String year = scanner.nextLine();

        ProcessBuilder pb = new ProcessBuilder("python3", "fetch_data.py", symbol, year);
        Process process = pb.start();

        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String lastLine = "", line;
        while ((line = reader.readLine()) != null) {
            System.out.println(line);  // print all lines
            lastLine = line;
        }

        // New code to split the last line into two parts at the '{' character
        String[] parts = lastLine.split("\\{", 2);
        String jsonData = "{" + parts[1];

        JSONObject jsonObject = new JSONObject(jsonData);
        System.out.println(jsonObject);
    }
}
