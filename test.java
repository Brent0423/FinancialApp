import java.util.Scanner;

public class test {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int input;

        do {
            System.out.println("Give a number:");
            input = scanner.nextInt();
        } while (input != 4);

        scanner.close();
    }
}
