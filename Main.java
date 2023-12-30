

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
        String line;
        while ((line = reader.readLine()) != null) {
            System.out.println(line);
        }
    }
}
