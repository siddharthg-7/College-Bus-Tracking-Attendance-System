# Testing Smooth Bus Tracking - Quick Guide

## Prerequisites
- Backend server running
- Frontend dev server running
- At least one driver account and one student account
- Student assigned to a route/stop

## Test Scenario 1: Basic Smooth Movement

### Steps:
1. **Login as Driver**
   - Navigate to driver login
   - Start a trip

2. **Login as Student** (in different browser/tab)
   - View the map on student dashboard
   - You should see the bus marker appear

3. **Simulate Movement** (Driver side)
   - Walk around with your phone/laptop
   - OR use browser dev tools to simulate GPS

4. **Observe** (Student side)
   - Bus marker should **glide smoothly** between positions
   - No "jumping" or "teleporting"
   - Marker should move over ~1 second per update

### Expected Behavior:
✅ Smooth, continuous movement  
✅ No sudden jumps  
✅ Animation completes before next update  

## Test Scenario 2: Vehicle Rotation

### Steps:
1. **With trip active**, move in different directions
2. **Observe the bus icon** (🚌)

### Expected Behavior:
✅ Bus icon rotates to face direction of movement  
✅ Rotation is smooth (no spinning)  
✅ Icon points "forward" along the route  

## Test Scenario 3: Rapid Updates

### Steps:
1. **Simulate rapid GPS updates** using console:

```javascript
// In Student Dashboard, open browser console
const testPositions = [
    { latitude: 28.6139, longitude: 77.2090 },
    { latitude: 28.6149, longitude: 77.2100 },
    { latitude: 28.6159, longitude: 77.2110 },
    { latitude: 28.6169, longitude: 77.2120 }
];

let index = 0;
const interval = setInterval(() => {
    // This simulates receiving WebSocket updates
    // Note: You'll need to manually trigger setBusLocation
    // or send from driver side
    console.log('Simulating position:', testPositions[index]);
    index = (index + 1) % testPositions.length;
}, 2000);

// To stop: clearInterval(interval);
```

### Expected Behavior:
✅ Marker smoothly transitions between all positions  
✅ No animation conflicts  
✅ Previous animation cancels when new update arrives  

## Test Scenario 4: Edge Cases

### Test A: No Movement
**Steps**: Keep device stationary  
**Expected**: Marker stays in place (no jitter)

### Test B: Very Slow Movement
**Steps**: Move very slowly (walking pace)  
**Expected**: Smooth, slow gliding motion

### Test C: Fast Movement
**Steps**: Simulate driving speed  
**Expected**: Faster animation, still smooth

### Test D: Direction Changes
**Steps**: Move in a zigzag pattern  
**Expected**: Bus icon rotates correctly at each turn

## Browser DevTools Testing

### Simulate GPS Movement (Chrome/Edge):
1. Open DevTools (F12)
2. Click **⋮** (More tools) → **Sensors**
3. Under "Location", select "Other..."
4. Enter coordinates and click "Manage"
5. Change coordinates to simulate movement

### Monitor Performance:
1. Open DevTools → **Performance** tab
2. Start recording
3. Trigger GPS updates
4. Stop recording
5. Check for smooth 60fps animation

### Check for Memory Leaks:
1. Open DevTools → **Memory** tab
2. Take heap snapshot
3. Start/stop trip multiple times
4. Take another snapshot
5. Compare - should not grow significantly

## Visual Inspection Checklist

| Feature | Working? | Notes |
|---------|----------|-------|
| Smooth position updates | ☐ | No jumping |
| Bus icon rotation | ☐ | Faces direction |
| Animation timing | ☐ | ~1 second |
| No lag/delay | ☐ | Responsive |
| Pulse animation | ☐ | Blue ring |
| Stop markers | ☐ | Visible |
| Route line | ☐ | Blue line |
| Visited stops | ☐ | Green checkmark |

## Common Issues & Solutions

### Issue: Bus marker jumps instead of gliding
**Cause**: CSS transition conflict  
**Fix**: Ensure `.custom-bus-marker` has no `transition` property

### Issue: Bus doesn't rotate
**Cause**: Bearing calculation error  
**Fix**: Check console for errors in `calculateBearing()`

### Issue: Animation is choppy
**Cause**: Low frame rate or CPU throttling  
**Fix**: Close other tabs, check Performance tab

### Issue: Marker lags behind real position
**Cause**: Animation duration too long  
**Fix**: Reduce `ANIMATION_DURATION` in `BusMap.jsx`

### Issue: Multiple buses appear
**Cause**: Previous marker not cleaned up  
**Fix**: Check that `busMarkerRef.current.remove()` is called

## Performance Benchmarks

### Target Metrics:
- **Frame Rate**: 60 fps during animation
- **Animation Duration**: 1000ms (configurable)
- **Memory Usage**: < 50MB increase per trip
- **CPU Usage**: < 10% during animation

### How to Measure:
```javascript
// Add to BusMap.jsx for debugging
console.time('animation');
// ... animation code ...
console.timeEnd('animation'); // Should be ~1000ms
```

## Advanced Testing: GPS Filtering

### Enable GPS Filtering:
1. Uncomment imports in `DriverDashboard.jsx`
2. Uncomment Kalman filter initialization
3. Uncomment filtering code in `watchPosition`

### Test Filtering:
1. Simulate GPS errors (sudden jumps)
2. Check console for "Invalid GPS update filtered out"
3. Verify marker doesn't jump to error position

## Mobile Testing

### iOS Safari:
- Test on actual iPhone (simulator GPS is limited)
- Check that rotation works correctly
- Verify smooth animation on 60Hz/120Hz displays

### Android Chrome:
- Test on actual Android device
- Enable "Show GPU overdraw" in Developer Options
- Verify no excessive overdraw

## Automated Testing (Future)

### Suggested Tests:
```javascript
describe('BusMap Smooth Tracking', () => {
    it('should animate marker smoothly', async () => {
        // Test LERP animation
    });

    it('should calculate bearing correctly', () => {
        const bearing = calculateBearing(
            { latitude: 0, longitude: 0 },
            { latitude: 1, longitude: 1 }
        );
        expect(bearing).toBeCloseTo(45, 1);
    });

    it('should cancel previous animation', () => {
        // Test animation cleanup
    });
});
```

## Video Recording for Verification

### Record Test Session:
1. Use screen recording software
2. Record student dashboard during trip
3. Play back at 0.5x speed
4. Verify smooth frame-by-frame movement

### Share with Team:
- Upload to project documentation
- Use for demo/presentation
- Compare with Uber/Ola for reference

## Success Criteria

✅ **Smooth Movement**: Marker glides, doesn't jump  
✅ **Correct Rotation**: Bus faces direction of travel  
✅ **60fps Animation**: No dropped frames  
✅ **No Memory Leaks**: Stable memory usage  
✅ **Responsive**: Updates within 1 second  
✅ **Accurate**: Marker position matches GPS  

## Next Steps After Testing

1. **If issues found**: Check troubleshooting section
2. **If working well**: Consider enabling GPS filtering
3. **For production**: Test with real devices on actual routes
4. **For optimization**: Profile with DevTools, optimize if needed

---

**Happy Testing! 🚌**

For more details, see `SMOOTH_TRACKING_GUIDE.md`
