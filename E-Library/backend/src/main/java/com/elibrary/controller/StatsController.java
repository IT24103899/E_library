package com.elibrary.controller;

import com.elibrary.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stats")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class StatsController {

    @Autowired
    private ActivityService activityService;

    // GET - Retrieve user statistics
    @GetMapping
    public ResponseEntity<ActivityService.ActivityStatsDTO> getStats(@RequestParam Long userId) {
        try {
            ActivityService.ActivityStatsDTO stats = activityService.getUserStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}
