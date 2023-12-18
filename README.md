# Space News
Here you can find the whole code for the project in the course Fundamentals of Webengineering 2023 from ETH.

# Project Title
Space-News
## Team Members
1. DeValdi
2. Gnkgo
3. Nick
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
- [Moon API](https://www.visualcrossing.com/)

  
### Tasks
Displaying important information about
- Earth
- Near Earth object studies
- Mars
- Moon

## Requirements

## How to Run
You have two options:

Click on this link:
[Space-News](http://space-news.course-fwe-2023.isginf.ch/)

Run the website locally:
- clone the repository;
- open a terminal instance and using the command ```cd``` move to the folder where the project has been downloaded;
- run: git clone https://github.com/Gnkgo/space-news.git
- run npm i 
- run docker build -t space-news .
- run docker run -it --rm -p 5173:5173 space-news
- Open a browser and connect to http://localhost:5173

## Milestones
Document here the major milestones of your code and future planned steps.\
- [X] Moon
  - [X] Show current moon
  - [X] Show countdown
    - [X] Fancy countdown   
  - [X] make button to choose a date in the future
  - [X] make a back button
  - [X] use location
      
- [X] Mars
  - [X] display weather
  - [X] have a paragraph that describes it
  - [X] have a nice layout
  - [X] make temperature graph
    - [X] make better ticks
  - [X] make mars picture button
     
- [X] Earth
- [X] Backend

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

##### Struggles:
- D3 and the temperature graph

### 7.Dezember 2023 - 15. Dezember 2023
#### Gnkgo:
##### Mars:
- Better temperature graph with lines
  - Displays the temperature and date when hover over it
- Pictures from rovers with modals


##### Moon:
- Better images
- Different Layout



## Versioning

[20. November 2023, v0.0.0](https://github.com/Gnkgo/space-news/releases/tag/v0.0.0)

[27. November 2023, v0.1.0](https://github.com/Gnkgo/space-news/releases/tag/v0.1.0)

[4. November 2023, v0.2.0](https://github.com/Gnkgo/space-news/releases/tag/v0.2.0)

[10. November 2023, v1.0.0](https://github.com/Gnkgo/space-news/releases/tag/v1.0.0)

[15. Dezember 2023, v1.1.1](https://github.com/Gnkgo/space-news/releases/tag/v1.1.1)







## Project Description 
The project is about wanting to create a website with three different components: Earth, Mars and Moon. Each component can be accessed to show more data about the associated celestial body. For the Earth, we want to show the current asteroids and comets and where they can be found. For Mars, a weather forecast will be shown. For the Moon, its current state (phase, special phenomena) will be displayed.


### Project goals
- Being able to retrieve data from an API
- Serving external NASA/Moon data in an aesthetically pleasing interface and providing a great user experience
  
### Data Sources
- [NASA API](https://api.nasa.gov/)
- [Moon API](https://www.visualcrossing.com/)

  
### Tasks
Displaying important information about
- Earth
- Near Earth object studies
- Mars
- Moon

## Requirements

## How to Run
You have two options:

Click on this link:
[Space-News](http://space-news.course-fwe-2023.isginf.ch/)

Run the website locally:
- clone the repository;
- open a terminal instance and using the command ```cd``` move to the folder where the project has been downloaded;
- run: git clone https://github.com/Gnkgo/space-news.git
- run npm i 
- run docker build -t space-news .
- run docker run -it --rm -p 5173:5173 space-news
- Open a browser and connect to http://localhost:5173


## Milestones
Document here the major milestones of your code and future planned steps.\
- [X] Moon
  - [X] Show current moon
  - [X] Show countdown
    - [X] Fancy countdown   
  - [X] make button to choose a date in the future
  - [X] make a back button
  - [X] use location
      
- [X] Mars
  - [X] display weather
  - [X] have a paragraph that describes it
  - [X] have a nice layout
  - [X] make temperature graph
    - [X] make better ticks
  - [X] make mars picture button
     
- [X] Earth
- [X] Backend