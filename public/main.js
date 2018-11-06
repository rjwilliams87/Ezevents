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
            <label for="event_food_quantity${count}">Quantity</label>
            <input type="number" id="event_food_quantity${count}" class="">
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
            <label for="event_bev_quantity${count}">Quantity</label>
            <input type="number" id="event_bev_quantity${count}" class="">
            `
        )
    })
}

//api request
//get all
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

//get by id
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

function generateEventReportById(data){
    const {id, contact, date, time, order, beverageTotalCost, foodTotalCost, orderTotal} = data;
    $('.event_report').html(
        `
        <div class="event_report_display">
            <div class="report_contact">
                <h2>Contact Information</h2>
                <p>Name: ${contact.firstName} ${contact.lastName}</p>
                <p>email: ${contact.email}</p>
                <p>phone: ${contact.phone}</p>
            </div>
            <div class="report_invoice">
                <h2>Invoice</h2>
                <h3>Food Order</h3>
                ${order.food.forEach(item => {return `
                    <p>Item: ${item.type}</p>
                    <p>Cost per order: ${item.pricePerOrder}</p>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Price: $${JSON.parse(item.pricePerOrder) * JSON.parse(item.quantity)}</p>
                `})}
                <h3>Beverage Order</h3>
                ${order.beverage.forEach(item => {return `
                <p>Item: ${item.type}</p>
                <p>Cost per order: ${item.pricePerOrder}</p>
                <p>Quantity: ${item.quantity}</p>
                <p>Price: $${JSON.parse(item.pricePerOrder) * JSON.parse(item.quantity)}</p>
                `})}
                <h3>Invoice Total</h3>
                <p>Total Food Cost: $${foodTotalCost}</p>
                <p>Total Beverage Cost: $${beverageTotalCost}</p>
                <p>Rental Price: $${order.rentalPrice}</p>
                <p>Total Event Cost: ${orderTotal}</p>
            </div>
        </div>
        <div class="update_delete_section">
            <button class="js_update_button">Update Event</button>
            <button class="js_delete_button">Delete Event</button>
        </div>
        `
    );
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

//POST create event


displayNewEventForm();
addFoodInputField();
addBevInputField();