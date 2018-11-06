'use strict';
const token = localStorage.getItem('authToken');
const username = localStorage.getItem('username');

function displayNewEventForm(){
    $('.js_create_event_button').click(e => {
        e.preventDefault();
        $('.create_form').prop('hidden', false);
        $('.events_list').prop('hidden', true);
    })
}

function addFoodInputField(){
    let count = 1;
    $('.new_event_form').on('click', '.add_food_button', e => {
        e.preventDefault();
        count++
        $('.food_order_input').append(
            `
            <label for="event_food_item${count}" class="">Food Item:</label>
            <input type="text" id="event_food_item${count}" class="">
            <label for="item_cost${count}">Cost Per Item:</label>
            <input type="number" id="item_cost${count}">
            `
        );
    });
}

function addBevInputField(){
    let count = 1;
    $('.new_event_form').on('click', '.add_bev_button', e => {
        e.preventDefault();
        count++
        $('.bev_order_input').append(
            `
            <label for="event_bev_item${count}" class="">Beverage Item:</label>
            <input type="text" id="event_bev_item${count}" class="">
            <label for="item_cost${count}">Cost Per Item:</label>
            <input type="number" id="item_cost${count}">
            `
        )
    })
}

//api request
function getAllEventsData(callback){
    $.ajax({
        url: '/api/events',
        contentType: 'application/json',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .done(results => {
        callback(results);
    })
    .fail(err => {
        console.error(`error ${err.message}`);
    })
}

function displayAllEvents(data){
    if (data.length === 0) {
        $('.event_table').html(
            `
            <p>Add events to see them displayed here!</p>
            `
        )
    }else {
        for (let i = 0; i < data.length; i++){
            generateEventRowDisplay(data[i]);
        }
    }
}

function generateEventRowDisplay(data){
    const {id, contact, date, orderTotal} = data;
    $('.event_table').append(
        `
        <div>
            <ul>
                <li><a href="#" id="${id}" class="event_id">Event #${id}</a></li>
                <li>${contact}</li>
                <li>${date}</li>
                <li>${orderTotal}</li>
            <ul>
        </div>
        `
    );
}

function getAndDisplayEventTable(){
    getAllEventsData(displayAllEvents);
}
//this doesn't go here move it after work
getAndDisplayEventTable();

function getEventDataById(id, callback){
    $.ajax({
        url: `/api/events/${id}`,
        contentType: 'application/json',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .done(results => {
        callback(results);
    })
    .fail(err => {
        console.error(`error: ${error.message}`);
    })
}

function displayEventById(data){
    generateEventReportById(data);
}

function getAndDisplayEventById(data){
    $('.event_id').on('click', e => {
        e.preventDefault();
        const id = this.prop('id').val();
        getEventDataById(id, displayEventById)
        $('.main').prop('hidden', true);
        $('.event_report').prop('hidden', false);
    })
}

function generateEventReportById(data){
    const {id, contact, date, time, order, beverageTotalCost, foodTotalCost, orderTotal} = data;
    $('.event_report').html(
        `
        
        `
    )
}

displayNewEventForm();
addFoodInputField();
addBevInputField();