'use strict';
const token = localStorage.getItem('authToken');
const username = localStorage.getItem('username');

//nav bar toggle
function menuToggle(){
    $('.menu_toggle').on('click', function(){
        $('nav').toggleClass('toggle');
    })
}

menuToggle();

function displayNewEventForm(){
    $('.js_create_event_button').click(e => {
        e.preventDefault();
        $('.create_form').prop('hidden', false);
        $('.events_list').prop('hidden', true);
    })
}

function addFoodInputField(){
    let count = 0;
    $('.new_event_form').on('click', '.add_food_button', e => {
        e.preventDefault();
        count++
        $('.food_order_input').append(
            `
            <label for="event_food_item${count}" class="">Food Item:</label>
            <input type="text" id="event_food_item${count}" class="food_type" name="food[${count}][type]">
            <label for="item_cost${count}">Cost Per Item:</label>
            <input type="number" id="item_cost${count}" class="food_cost" name="food[${count}][pricePerOrder]">
            <label for="event_food_quantity${count}">Quantity</label>
            <input type="number" id="event_food_quantity${count}" class="food_quantity" name="food[${count}][quantity]">
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
            <label for="event_bev_item" class="">Beverage Item:</label>
            <input type="text" id="event_bev_item" class="bev_type">
            <label for="item_cost">Cost Per Item:</label>
            <input type="number" id="item_cost" class="bev_cost">
            <label for="event_bev_quantity">Quantity</label>
            <input type="number" id="event_bev_quantity" class="bev_quantity">
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
    const {id, contact, date, order} = data;
    let foodTotalCost = order.food.map((index)=> index.pricePerOrder * index.quantity).reduce((a, b) => {return a+b});
    let bevTotalCost = order.beverages.map((index)=> index.pricePerOrder * index.quantity).reduce((a, b) => {return a+b});
    let totalCost = foodTotalCost + bevTotalCost + order.rentalPrice;
    $('.event_table').append(
        `
        <div>
            <ul>
                <li><a href="#" id="${id}" class="event_id">Event #${id}</a></li>
                <li>${contact.lastName}, ${contact.firstName}</li>
                <li>${date}</li>
                <li>${totalCost}</li>
            <ul>
        </div>
        `
    );
}

function getAndDisplayEventTable(){
    $('main').prop('hidden', false);
    $('.event_table').html('');
    $('.events_list').prop('hidden', false);
    $('.event_table').prop('hidden', false);
    $('.event_report').prop('hidden', true);
    $('.update_form').prop('hidden', true);
    $('.create_form').prop('hidden', true);
    // getAllEventsData(displayAllEvents);
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
    const {id, contact, date, time, order} = data;
    let foodTotalCost = order.food.map((index)=> index.pricePerOrder * index.quantity).reduce((a, b) => {return a+b});
    let bevTotalCost = order.beverages.map((index)=> index.pricePerOrder * index.quantity).reduce((a, b) => {return a+b});
    let totalCost = foodTotalCost + bevTotalCost + order.rentalPrice;
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
                ${order.food.map(item => {return `
                    <p>Item: ${item.type}</p>
                    <p>Cost per order: ${item.pricePerOrder}</p>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Price: $${JSON.parse(item.pricePerOrder) * JSON.parse(item.quantity)}</p>
                `}).join('')}
                <h3>Beverage Order</h3>
                ${order.beverages.map(item => {return `
                <p>Item: ${item.type}</p>
                <p>Cost per order: ${item.pricePerOrder}</p>
                <p>Quantity: ${item.quantity}</p>
                <p>Price: $${JSON.parse(item.pricePerOrder) * JSON.parse(item.quantity)}</p>
                `}).join('')}
                <h3>Invoice Total</h3>
                <p>Total Food Cost: $${foodTotalCost}</p>
                <p>Total Beverage Cost: $${bevTotalCost}</p>
                <p>Rental Price: $${order.rentalPrice}</p>
                <p>Total Event Cost: $${totalCost}</p>
            </div>
        </div>
        <div class="update_delete_section" id="${id}">
            <button class="js_update_button">Update Event</button>
            <button class="js_delete_button">Delete Event</button>
        </div>
        
        <div class="update_form" hidden></div>
        `
    );
}

function getAndDisplayEventById(){
    $('.event_table').on('click', '.event_id', e => {
        e.preventDefault();
        $('main').prop('hidden', true);
        $('.event_report').prop('hidden', false);
        const id = $(e.target).closest('a').attr('id');
        getEventDataById(id, displayEventById)
    })
}
//also doesn't go here move after work 
getAndDisplayEventById();

//PUT update event info
function updateEventData(_id, _eventInfo){
    $.ajax({
        url: `/api/events/${_id}`,
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        method: 'PUT',
        data: JSON.stringify(_eventInfo),
        dataType: 'json'
    })
    .done(() => {
        refreshEventsPage();
    })
    .fail(err => {
        console.error(`error: ${err.message}`);
    })
}

function displayUpdateForm(data){
    const {id, contact, date, time, order} = data;
    $('.update_form').html(
        `
        <form class="update_event_form">
        <fieldset>
            <legend>Contact Information</legend>
            <label for="update_firstName" class="">First Name:</label>
            <input type="text" id="update_firstName" class="" value="${contact.firstName}">
            <label for="update_lastName" class="">Last Name:</label>
            <input type="text" id="update_lastName" class="" value="${contact.lastName}">
            <label for="update_email" class="">Email:</label>
            <input type="text" id="update_email" class="" value="${contact.email}">
            <label for="update_phone" class="">Phone:</label>
            <input type="text" id="update_phone" class="" value="${contact.phone}">
        </fieldset>
        <fieldset>
            <legend>Event Date and Time</legend>
            <label for="update_date">Date:</label>
            <input type="text" id="update_date" class="" value="${date}">
            <label for="update_time">Time:</label>
            <input type="text" id="update_time" value="${time}">
        </fieldset>
        <fieldset class="food_order_input">
            <legend>Food Order</legend>
            ${order.food.map(item => {return `
                <label for="update_food_item" class="">Food Item:</label>
                <input type="text" id="update_food_item" class="food_type" value="${item.type}">
                <label for="update_food_cost">Cost Per Item:</label>
                <input type="number" id="update_food_cost" class="food_cost" value="${item.pricePerOrder}">
                <label for="update_food_quantity">Quantity</label>
                <input type="number" id="update_food_quantity" class="food_quantity" value="${item.quantity}">`
            }).join('')}
            <button class="add_food_button">Add More Food</button>
        </fieldset>
        <fieldset class="bev_order_input">
                <legend>Beverage Order</legend>
                ${order.beverages.map(item => {return `
                <label for="update_bev_item" class="">Food Item:</label>
                <input type="text" id="update_bev_item" class="bev_type" value="${item.type}">
                <label for="update_bev_cost">Cost Per Item:</label>
                <input type="number" id="update_bev_cost" class="bev_cost" value="${item.pricePerOrder}">
                <label for="update_bev_quantity">Quantity</label>
                <input type="number" id="update_bev_quantity" class="bev_quantity" value="${item.quantity}">`
            }).join('')}
                <button class="add_bev_button">Add More Beverages</button>
        </fieldset>
        <fieldset>
            <legend>Room and Equipment Rental</legend>
            <label for="update_rental_price">Rental Price:</label>
            <input type="number" id="update_rental_price" value="${order.rentalPrice}">
        </fieldset>
        <button class="js_put_btn" id="${id}">Update Event</button>
        <button>Cancel</button>
    </form>
        `
    )
}

function createAndDisplayUpdateForm(){
    $('.event_report').on('click', '.js_update_button', e =>{
        e.preventDefault();
        const id = $('.update_delete_section').attr('id')
        $('.event_report_display').prop('hidden', true);
        $('.update_form').prop('hidden', false);
        getEventDataById(id, displayUpdateForm);
    })
}

function handleUpdateSubmit(){
    $('.event_report').on('click', '.js_put_btn', e => {
        e.preventDefault();
        let foodType = [];
        let foodCost = [];
        let foodQuantity = [];
        let foodObjects = []
        $('.food_type').each(function(){
            let input = $(this).val();
            foodType.push(input);
        })
        $('.food_cost').each(function(){
            let input = $(this).val();
            foodCost.push(input);
        })
        $('.food_quantity').each(function(){
            let input = $(this).val();
            foodQuantity.push(input);
        })
        for(let i = 0; i < foodType.length; i++){
            foodObjects.push({
                type: foodType[i],
                pricePerOrder: foodCost[i],
                quantity: foodQuantity[i]
            })
        }

        let bevType = [];
        let bevCost = [];
        let bevQuantity = [];
        let bevObjects = []
        $('.bev_type').each(function(){
            let input = $(this).val();
            bevType.push(input);
        })
        $('.bev_cost').each(function(){
            let input = $(this).val();
            bevCost.push(input);
        })
        $('.bev_quantity').each(function(){
            let input = $(this).val();
            bevQuantity.push(input);
        })
        for(let i = 0; i < bevType.length; i++){
            bevObjects.push({
                type: bevType[i],
                pricePerOrder: bevCost[i],
                quantity: bevQuantity[i]
            })
        }
        const id = $('.js_put_btn').attr('id');
        const eventInfo = {
            id: id,
            contact: {
                firstName: $('#update_firstName').val(),
                lastName: $('#update_lastName').val(),
                email: $('#update_email').val(),
                phone: $('#update_phone').val()
            },
            date: $('#update_date').val(),
            time: $('#update_time').val(),
            order: {
                food: foodObjects,
                beverages: bevObjects,
                rentalPrice: $('#update_rental_price').val()
            }

        };
        updateEventData(id, eventInfo);
    })
}

createAndDisplayUpdateForm();
handleUpdateSubmit();

//DELETE deleting event
function deleteEvent(_id){
    $.ajax({
        url: `/api/events/${_id}`, 
        contentType: 'application/json',
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .done(()=>{
        refreshEventsPage();
    })
    .fail(err => {
        console.error(`error: ${err.message}`);
    })
}

function handleDeleteButton(){
    $('.event_report').on('click', '.js_delete_button', e=>{
        e.preventDefault();
        const id = $('.update_delete_section').attr('id')
        deleteEvent(id);
    })
}
handleDeleteButton();

// POST create event
function postEventData(_eventInfo){
        $.ajax({
            url: '/api/events',
            contentType: 'application/json',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            data: JSON.stringify(_eventInfo),
            dataType: 'json'
        })
        .done(() => {
            refreshEventsPage();
        })
        .fail(err => {
            console.error(`error: ${err.message}`);
        })
}

function handleCreateButton(){
    $('.create_form').on('submit', e => {
        let foodType = [];
        let foodCost = [];
        let foodQuantity = [];
        let foodObjects = []
        $('.food_type').each(function(){
            let input = $(this).val();
            foodType.push(input);
        })
        $('.food_cost').each(function(){
            let input = $(this).val();
            foodCost.push(input);
        })
        $('.food_quantity').each(function(){
            let input = $(this).val();
            foodQuantity.push(input);
        })
        for(let i = 0; i < foodType.length; i++){
            foodObjects.push({
                type: foodType[i],
                pricePerOrder: foodCost[i],
                quantity: foodQuantity[i]
            })
        }

        let bevType = [];
        let bevCost = [];
        let bevQuantity = [];
        let bevObjects = []
        $('.bev_type').each(function(){
            let input = $(this).val();
            bevType.push(input);
        })
        $('.bev_cost').each(function(){
            let input = $(this).val();
            bevCost.push(input);
        })
        $('.bev_quantity').each(function(){
            let input = $(this).val();
            bevQuantity.push(input);
        })
        for(let i = 0; i < bevType.length; i++){
            bevObjects.push({
                type: bevType[i],
                pricePerOrder: bevCost[i],
                quantity: bevQuantity[i]
            })
        }

        e.preventDefault();
        const eventInfo = {
            contact: {
                firstName: $('#contact_firstName').val(),
                lastName: $('#contact_lastName').val(),
                email: $('#contact_email').val(),
                phone: $('#contact_phone').val()
            },
            date: $('#event_date').val(),
            time: $('#event_time').val(),
            order: {
                food: foodObjects,
                beverages: bevObjects,
                rentalPrice: $('#event_rental_price').val()
            }
        };
        postEventData(eventInfo);
    })
}

handleCreateButton();
//clean up below, for testing purposes for now
function refreshEventsPage(){
    getAndDisplayEventTable();
}

displayNewEventForm();
addFoodInputField();
addBevInputField();