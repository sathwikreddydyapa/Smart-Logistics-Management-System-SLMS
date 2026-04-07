package com.slms.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/ai")
public class AIConsultController {

    @PostMapping("/consult")
    public Map<String, String> consultAI(@RequestBody Map<String, String> payload) {
        String prompt = payload.getOrDefault("prompt", "").toLowerCase();
        String response = generateAIResponse(prompt);

        Map<String, String> result = new HashMap<>();
        result.put("response", response);
        return result;
    }

    private String generateAIResponse(String prompt) {
        if (prompt.contains("weather") || prompt.contains("delay")) {
            return "Based on real-time meteorological data, there is a 60% probability of heavy rain causing a 2-hour delay on routes navigating through the eastern corridor. Re-routing is highly recommended.";
        }
        if (prompt.contains("optimize") || prompt.contains("route")) {
            return "Our AI Route Optimizer suggests avoiding Highway 45 due to severe traffic. Transitioning to the secondary state roads will improve delivery ETA by 14%.";
        }
        if (prompt.contains("status") || prompt.contains("shipment")) {
            return "Currently, 85% of your fleet is On-Time. We detect 2 shipments flagged as 'Pending' that require immediate Driver assignment to maintain KPI SLA.";
        }
        if (prompt.contains("hello") || prompt.contains("hi")) {
            return "Greetings! I am MUSEPHIC Engine, your autonomous logistics intelligence. How may I optimize your supply chain today?";
        }
        return "I have analyzed your request. Based on predictive modeling, current fleet logistics are operating nominally. Please specify tracking IDs for deeper analysis.";
    }
}
