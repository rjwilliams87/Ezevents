'use strict';

//cache DOM
const $main = $('main');
const $showFormBtn = $main.find('.js_create_event_button');
const $createForm = $main.find('.create_form');
const $eventsList = $main.find('.events_list');
const $newEventForm = $main.find('.new_event_form');
const $foodInput = $main.find('.food_order_input');
const $bevInput = $main.find('.bev_order_input');
const $eventTable = $main.find('.event_table');
const $eventReport = $('.event_report');
const $updateDeleteContainer = $eventReport.find('.update_delete_section');
const $reportContainer = $eventReport.find('.event_report_display');
const $updateEventForm = $eventReport.find('.update_form');
const $header = $('header');
const $nav = $header.find('nav');
const $menuToggler = $header.find('.menu_toggle');
// const $updateDeleteContainer = $('.update_delete_section');

//AJAX
const AJAX = function (){
    const token = localStorage.getItem('authToken');

    function request(url, method, callback, data){
        const request = {
            url: url,
            method: method,
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(data),
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        return $.ajax(request).done(callback).fail(err => {console.error(err);});
    }

    return {
        request
    }
}

const ajax = AJAX();

$menuToggler.on('click', toggleClass);
$showFormBtn.on('click', displayCreateEventForm);
$newEventForm.on('click', '.add_food_button', addFoodInputFields);
$newEventForm.on('click', '.add_bev_button', addBevInputFields)
$eventTable.on('click', '.event_id', getAndDisplayEventReport);
$eventReport.on('click', '.js_update_button', displayUpdateForm);
$eventReport.on('click', '.js_put_btn', handleUpdateSubmit);
$eventReport.on('click', '.js_delete_button', handleDeleteButton);
$createForm.on('submit', handleCreateButton);

function toggleClass(e) {
    e.preventDefault();
    $nav.toggleClass('toggle');
}

function displayNone(array){
    array.forEach(element => {
        element.hide();
    })
}

function displayElements(array) {
    array.forEach(element => {
        element.show();
    })
}

function showElements(elements) {
    elements.forEach(element => {
        element.prop('hidden', false);
    })
}

function hideElements(elements) {
    elements.forEach(element => {
        element.prop('hidden', true);
    })
}

function refreshEventsPage() {
    $eventTable.html('');
    getAndDisplayEventTable();
}

function displayAllEvents(data) {
    for(let i = 0; i < data.length; i++) {
        renderEventRow(data[i]);
        console.log(data[i]);
    }
}

function renderEventRow(data) {
    const {id, contact, date, order} = data;
    let foodTotalCost = order.food.map((index)=> index.pricePerOrder * index.quantity).reduce((a, b) => {return a+b});
    let bevTotalCost = order.beverages.map((index)=> index.pricePerOrder * index.quantity).reduce((a, b) => {return a+b});
    let totalCost = foodTotalCost + bevTotalCost + order.rentalPrice;
    $eventTable.append(
        `
        <div class="event_table_row">
            <ul class="row_list">
                <li><a href="#" id="${id}" class="event_id">Event Report</a></li>
                <li><span class="row_list_category">Contact:</span> ${contact.lastName}, ${contact.firstName}</li>
                <li><span class="row_list_category">Date:</span> ${date}</li>
                <li><span class="row_list_category">Total Cost:</span> $${totalCost}</li>
                <li>
                    <span class="icon icon_update"><i class="fa fa-pencil-square fa-2x" aria-hidden="true"></i></span>
                    <span class="icon icon_delete"><i class="fa fa-trash fa-2x" aria-hidden="true"></i></span>
                </li>
            <ul>
        </div>
        `
    );
}

function getAndDisplayEventTable() {
    $eventTable.html('');
    displayNone([$eventReport, $updateEventForm, $createForm]);
    displayElements([$main, $eventsList, $eventTable]);
    ajax.request('/api/events', 'GET', displayAllEvents);
}

function displayEventById(data) {
    generateEventReport(data);
}

function generateEventReport(data) {
    const {id, contact, date, time, order} = data;
    let foodTotalCost = order.food.map((index)=> index.pricePerOrder * index.quantity).reduce((a, b) => {return a+b});
    let bevTotalCost = order.beverages.map((index)=> index.pricePerOrder * index.quantity).reduce((a, b) => {return a+b});
    let totalCost = foodTotalCost + bevTotalCost + order.rentalPrice;
    $eventReport.html(
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

function displayCreateEventForm(e) {
    e.preventDefault();
    $createForm.prop('hidden', false);
    $createForm.show();
    $eventsList.hide();
}

function addFoodInputFields(e) {
    e.preventDefault();
    //if id neccessary for accessibility add counter and use for id/labels
    $foodInput.append(`
    <label class="added_food_input">Food Item:</label>
    <input type="text" class="food_type">
    <label>Cost Per Item:</label>
    <input type="number" class="food_cost">
    <label>Quantity</label>
    <input type="number" class="food_quantity">
    `);
}

function addBevInputFields(e) {
    e.preventDefault();
    $bevInput.append(`
    <label class="added_bev_input">Beverage Item:</label>
    <input type="text" class="bev_type">
    <label for="item_cost">Cost Per Item:</label>
    <input type="number" id="item_cost" class="bev_cost">
    <label for="bev_quantity">Quantity</label>
    <input type="number" class="bev_quantity">
    `);
}

function getAndDisplayEventReport(e) {
    e.preventDefault();
    displayElements([$eventReport]);
    displayNone([$main]);
    showElements([$eventReport]);
    const id = $(e.target).closest('a').attr('id');
    ajax.request(`/api/events/${id}`, 'GET', displayEventById);
}

function displayUpdateForm(e) {
    e.preventDefault();
    const id = $('.update_delete_section').attr('id');
    hideElements([$('.event_report_display')]);
    showElements([$updateEventForm, $('.update_form')]);
    ajax.request(`/api/events/${id}`, 'GET', renderUpdateForm);
}

function renderUpdateForm(data) {
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
    );
}

function createOrderObjects () {
    let foodObjs = [];
    let bevObjs = [];

    const foodTypes = document.getElementsByClassName('food_type');
    const foodCost = document.getElementsByClassName('food_cost');
    const foodQuantity = document.getElementsByClassName('food_quantity');

    for (let i = 0; i < foodTypes.length; i++) {
        let type = foodTypes[i].value;
        let pricePerOrder = foodCost[i].value;
        let quantity = foodQuantity[i].value;

        const obj = {type, pricePerOrder, quantity};
        foodObjs.push(obj);
    }

    const bevTypes = document.getElementsByClassName('bev_type');
    const bevCost = document.getElementsByClassName('bev_cost');
    const bevQuantity = document.getElementsByClassName('bev_quantity');

    for (let i = 0; i < bevTypes.length; i++) {
        let type = bevTypes[i].value;
        let pricePerOrder = bevCost[i].value;
        let quantity = bevQuantity[i].value;

        const obj = {type, pricePerOrder, quantity};
        bevObjs.push(obj);
    }
    return {
        foodObjs,
        bevObjs
    }
}

function handleUpdateSubmit(e) {
    e.preventDefault();
    const order = createOrderObjects();
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
            food: order.foodObjs,
            beverages: order.bevObjs,
            rentalPrice: $('#update_rental_price').val()
        }
    }
    ajax.request(`/api/events/${id}`, 'PUT', getAndDisplayEventTable, eventInfo);
}

function handleDeleteButton(e) {
    e.preventDefault();
    const id = $('.update_delete_section').attr('id');
    ajax.request(`/api/events/${id}`, 'DELETE', refreshEventsPage);
}

function handleCreateButton(e) {
    e.preventDefault();
    const order = createOrderObjects();
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
            food: order.foodObjs,
            beverages: order.bevObjs,
            rentalPrice: $('#event_rental_price').val()
        }
    };
    ajax.request('/api/events', 'POST', refreshEventsPage, eventInfo);
}

getAndDisplayEventTable();