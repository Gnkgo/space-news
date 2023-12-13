# Space News
Here you can find the whole code for the project in the course Fundamentals of Webengineering 2023 from ETH.

# READ ME from FoWE-TEAM Skeleton

# Project Title
Space-News
## Team Members
1. DeValdi
2. Gnkgo
3. Nick

## Project Description 
The project is about wanting to create a website with three different components: Earth, Mars and Moon. Each component can be accessed to show more data about the associated celestial body. For the Earth, we want to show the current asteroids and comets and where they can be found. For Mars, a weather forecast will be shown. For the Moon, its current state (phase, special phenomena) will be displayed.


### Project goals
- Being able to retrieve data from an API
- Serving external NASA/Moon data in an aesthetically pleasing interface and providing a great user experience
  
### Data Sources
- [NASA API](https://api.nasa.gov/)
- [Moon API](https://dev.qweather.com/en/docs/api/astronomy/moon-and-moon-phase/)
- [Used Moon API](https://www.visualcrossing.com/)

  
### Tasks
Displaying important information about
- Earth
- Near Earth object studies
- Mars
- Moon

## Requirements
Write here all intructions to build the environment and run your code.\
**NOTE:** If we cannot run your code following these requirements we will not be able to evaluate it.

## How to Run
Write here **DETAILED** intructions on how to run your code.\
**NOTE:** If we cannot run your code following these instructions we will not be able to evaluate it.

As an example here are the instructions to run the Dummy Project:
To run the Dummy project you have to:
- clone the repository;
- open a terminal instance and using the command ```cd``` move to the folder where the project has been downloaded;
- then run:


### Local Development

Only change files inside the `src` directory.

**Client side**

All client side files are located in the `src/client` directory.

**Server side**

All server side files are located in the `src/server` directory.

### Local Testing

**run container for local testing**

```bash
docker build -t my-webapp .

docker run -it --rm -p 5173:5173 my-webapp
```
Open a browser and connect to http://localhost:5173

**run bash in interactive container**
```bash
docker build -t my-webapp src/.

docker run -it --rm -p 5173:5173 my-webapp bash
```


## Milestones
Document here the major milestones of your code and future planned steps.\
- [ ] Moon
  - [X] Show current moon
  - [X] Show countdown
    - [ ] Fancy countdown   
  - [X] make button to choose a date in the future
  - [X] make a back button
  - [X] use location
      
- [ ] Mars
  - [X] display weather
  - [X] have a paragraph that describes it
  - [X] have a nice layout
  - [X] make temperature graph
    - [ ] make better ticks
  - [X] make mars picture button
     
- [ ] Earth
- [ ] Backend

Create a list subtask.\
Open an issue for each subtask. Once you create a subtask, link the corresponding issue.\
Create a merge request (with corresponding branch) from each issue.\
Finally accept the merge request once issue is resolved. Once you complete a task, link the corresponding merge commit.\
Take a look at [Issues and Branches](https://www.youtube.com/watch?v=DSuSBuVYpys) for more details. 

This will help you have a clearer overview of what you are currently doing, track your progress and organise your work among yourselves. Moreover it gives us more insights on your progress.  

## Weekly Summary 
### 16. November 2023 - 23. November 2023
#### Gnkgo:
##### Mars:
- Creating first version of the mars component
- Challenging was the CSS layout and the grid.
- Get Mars picture and put it as a background
- Display Boxes with the weather of the last 6 days
- Display the current day box with more information
- Create a back button

###### Struggles:
- Mars API didn't work, since they stopped hosting their weather API.
  - Could resolve it and found another good one
- The API I use now is not up to date, since they are storms at Mars. 

### 23. November 2023 - 30. November 2023
#### Gnkgo:
##### Mars:
- Change how to display the whole content -> Put everything in one container
- New layout

##### Moon:
- Display current moon (there are 8 options)
- Display countdown when the next full moon is
- Display back button
- Show the moonrise and moonset

### 30. November 2023 - 7. December 2023
#### Gnkgo:
##### Mars:
- Temperature Graph that can zoom in
- Make Mars button to show picture of Mars
- Make modal for additional information for weather

##### Moon:
- Better layout

## Questions Meeting
- Better ticks in the graph?
- How to run it in Github -> How to deploy it?
  - Displaying of pictures do not work
  - public folder outside src?
- Do we need to copy paste it to Gitlab? 

## Versioning
Create stable versions of your code each week by using gitlab tags.\
Take a look at [Gitlab Tags](https://docs.gitlab.com/ee/topics/git/tags.html) for more details. 

Then list here the weekly tags. \
We will evaluate your code every week, based on the corresponding version.

Tags:
- Moon
- Mars



