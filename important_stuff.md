# Important Stuff


## APIs

[Moon and Moon Phase](https://dev.qweather.com/en/docs/api/astronomy/moon-and-moon-phase/)

[NASA: SSD/CNEOS](https://api.nasa.gov/)
- Asteroids NeoWs: Near Earth Object Web Service
  - (not good vectors to calculate)
- EONET: Earth Observatory Natural Event Tracker
- InSight: Mars Weather Service API
- Mars Rover Photos: Image data gathered by NASA's Curiosity, Opportunity, and Spirit rovers on Mars
- SSD/CNEOS: Solar System Dynamics and Center for Near-Earth Object Studies
- TLE API 
  - satellites instead of comets / asteroids?
- Satellite Situation Center 
  - better than TLE API?

## Split up Workload

### Deadlines: 
- 23. November First Standup 
- 7. December Meeting with TA

### Components
|Moon|Mars|Overview|Backend|Earth outer layer|Earth inner layer|
|-|-|-|-|-|-|
|graphically showing the visibility of the moon.  | graphically showing weather forecast. Max, min temperature.|Make it rotating, when is summer when is winter. how to display the rotation? where is the moon?  |API, Data cache, storage in data memory, no database|**Suggestion:** start with that when all the other satellites are done. |Maybe keep it simple. Just an arrow to show where a storm is. you could do it with three different maps where different parts of the earth is. 
|Displaying images.|Current Picture of Mars|adding a date and time.||Start maybe with a 2D representation and a simple arrow where the asteroids are. Check how hard the 3D implementation is.| Display an arrow with *There is a storm in Arizona* and explain Button to change between C and F.where, what when.
|Display next current event. (Full moon, solar eclipse, red moon etc.)||Totally cool would be a slider to display how it looks like in 2 months etc.|||Maybe a red dot and when you press on it you see the further information.
|Person X|Joanna|Nick|Valentin|Valentin?|Valentin?|


### Discussion 17. November:
- Should we have button to change time for weather forecast, moon etc.
- type script
- no react
- small backend $\rightarrow$ is this a task for one full member?
- how to get the information from APIs. get the same format.
- should you have data for weather forecast in the previous days? do you display it?
- Location of Moon Phase? Default Zurich?
  - Make window to show "Attention, Location will be asked"

#### Steps:
- Pop up windows
- Transitions to different satellites


#### Goals until 7. December
Website in 2D without animation but with full information
1. /moon.html
   1. visibility
   2. super moon
2. /mars.html
   1. weather forecast
3. /overview.html
   1. button
   2. rotation
