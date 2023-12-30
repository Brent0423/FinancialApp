import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ReturnRate {

    public List<Map<String, String>> getCPI() {
        List<Map<String, String>> observations = new ArrayList<>();
        try {
            HttpResponse<JsonNode> response = Unirest.get("https://api.stlouisfed.org/fred/series/observations")
                    // continue your code here...

            JSONObject body = response.getBody().getObject();
            JSONObject lastObservation = body.getJSONArray("observations")
                    // continue your code here...

            for (int i = 0; i < lastObservation.length(); i++) {
                JSONObject observation = lastObservation.getJSONObject(i);
                Map<String, String> observationMap = new HashMap<>();
                observationMap.put("date", observation.getString("date"));
                observationMap.put("value", observation.getString("value"));
                observations.add(observationMap);

                System.out.println("Date: " + observation.getString("date") + ", CPI: " + observation.getString("value"));
            }
        } catch (UnirestException e) {
            e.printStackTrace();
        }
        return observations;
    }

    public static void main(String[] args) {
        ReturnRate returnRate = new ReturnRate();
        List<Map<String, String>> cpi = returnRate.getCPI();
        for (Map<String, String> observation : cpi) {
            System.out.println("Date: " + observation.get("date") + ", CPI: " + observation.get("value"));
        }
    }
}
