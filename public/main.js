'use strict';

//cache DOM
const $htmlWrapper = $('#wrapper');

    //menu variables//
const $header = $htmlWrapper.find('header');
const $homeBtn = $header.find('#home_btn');
const $logoutBtn = $header.find('#logout_btn');
const $nav = $header.find('nav');
const $menuToggler = $header.find('.menu_toggle');

    //main, events_display, event_table variables
const $main = $htmlWrapper.find('main');
const $showFormBtn = $main.find('.js_create_event_button');
const $eventTable = $main.find('.event_table');
const $eventsList = $main.find('.events_list');

    //create form variables//
const $resetAnchor = $htmlWrapper.find('#reset_anchor');
const $formContainer = $htmlWrapper.find('.new_form_container');
const $newEventForm = $formContainer.find('.new_event_form');
const $formTimeInput = $formContainer.find('#event_time');
const $formDateInput = $formContainer.find('#event_date');
const $formFirstNameInput = $formContainer.find('#contact_firstName');
const $formLastNameInput = $formContainer.find('#contact_lastName');
const $formEmailInput = $formContainer.find('#contact_email');
const $formPhoneInput = $formContainer.find('#contact_phone');
const $formRentalInput = $formContainer.find('#event_rental_price');
const $foodInput = $htmlWrapper.find('.food_order_input');
const $bevInput = $htmlWrapper.find('.bev_order_input');

    //event_report variables//
const $eventReport = $htmlWrapper.find('.event_report');
const $updateDeleteContainer = $('.update_delete_section');
const $reportContainer = $eventReport.find('.event_report_display');
const $updateEventForm = $htmlWrapper.find('.update_form');
const $reportBtn = $('.report_btn');
const $addedUpdateBevInput = $('.bev_order_input2');
const $addedUpdatedFoodInput = $('.food_order_input2');

//bind events//
$homeBtn.on('click', refreshEventsPage);
$logoutBtn.on('click', logout);
// $main.on('click', '.icon_update', displayUpdateForm);
$menuToggler.on('click', toggleClass);
// $('nav').on('click', 'a', toggleClass);
$showFormBtn.on('click', displayCreateEventForm);
$newEventForm.on('click', '.add_food_button', addFoodInputFields);
$newEventForm.on('click', '.add_bev_button', addBevInputFields);
// $eventReport.on('click', '.add_food_button', addFoodInputFields);
$eventTable.on('click', '.event_id', getAndDisplayEventReport);
$eventReport.on('click', '.js_update_button', displayUpdateForm);
$eventReport.on('submit', handleUpdateSubmit);
$eventReport.on('click', '.cancel_update_btn', refreshEventsPage);
$eventReport.on('click', '.js_delete_button', handleDeleteButton);
$main.on('click', '.icon_delete', handleDeleteButton);
$formContainer.on('submit', handleCreateButton);
$formContainer.on('click', '.cancel_post_button', refreshEventsPage);
// $eventReport.on('click', '.cancel_update_btn', refreshEventsPage);
$eventReport.on('click', '.add_food_button', addFoodtoUpdateForm);
$eventReport.on('click', '.add_bev_button', addBevToUpdateForm);

function logout(e) {
    e.preventDefault();
    localStorage.removeItem('Bearer')
    window.location.href = 'index.html';
}

//ajax function
function fetch(url, method, callback, data) {
    const token = localStorage.getItem('authToken');
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
    $.ajax(request).done(callback);
}

//display functions
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

function clearValues(elements) {
    elements.forEach(element => {
        element.val('');
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
    const eventDate = date.replace(/T.*$/,"");
    $eventTable.append(
        `
        <div class="event_table_row">
            <ul class="row_list">
                <li class="event_report_path table_li"><a href="#" id="${id}" class="event_id">Invoice</a></li>
                <li class="table_li"><span class="row_list_category">Contact:</span> ${contact.lastName}, ${contact.firstName}</li>
                <li class="table_li"><span class="row_list_category">Date:</span> ${eventDate}</li>
                <li class="table_li"><span class="row_list_category">Total Cost:</span> $${totalCost}</li>
                <li class="table_li table_li_icons">
                    <a id="_${id}_" class="icon icon_delete"><i class="fa fa-trash fa-2x" aria-hidden="true"></i></a>
                </li>
            <ul>
        </div>
        `
    );
}

function getAndDisplayEventTable() {
    $eventTable.html('');
    displayNone([$eventReport, $updateEventForm, $formContainer]);
    displayElements([$main, $eventsList, $eventTable]);
    fetch('/api/events', 'GET', displayAllEvents);
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
                <h3 class="invoice_order_head">Food Order</h3>
                ${order.food.map(item => {return `
                <div class="">
                    <ul class="order_grouping">
                        <li class="item_name order_li"><span class="item_name">Item:</span> ${item.type}</li>
                        <li class="order_li"><span>Cost per item:</span> ${item.pricePerOrder}</li>
                        <li class="order_li"><span>Quantity:</span> ${item.quantity}</li>
                        <li class="order_li"><span>Order Price:</span> $${JSON.parse(item.pricePerOrder) * JSON.parse(item.quantity)}</li>
                    </ul>
                </div>
                `}).join('')}
                <div class="grouping_total">
                    <p>Food Total: <span class="total">$${foodTotalCost}</span></p>
                </div>
                <h3 class="invoice_order_head">Beverage Order</h3>
                ${order.beverages.map(item => {return `
                <div class="">
                    <ul class="order_grouping">
                        <li class="item_name order_li"><span>Item:</span> ${item.type}</li>
                        <li class="order_li"><span>Cost per item:</span> ${item.pricePerOrder}</li>
                        <li class="order_li"><span>Quantity:</span> ${item.quantity}</li>
                        <li class="order_li"><span>Order Price:</span> $${JSON.parse(item.pricePerOrder) * JSON.parse(item.quantity)}</li>
                    </ul>
                </div>
                `}).join('')}
                <div class="grouping_total">
                    <p>Beverage Total: <span class="total">$${bevTotalCost}</span></p>
                </div>
                <h3 class="invoice_order_head">Invoice Total</h3>
                <ul class="order_totals">
                    <li class="total_li">Food Total: <span class="total">$${foodTotalCost}</span></li>
                    <li class="total_li">Beverage Total: <span class="total">$${bevTotalCost}</span></li>
                    <li class="total_li total_border">Rental Price: <span class="total">$${order.rentalPrice}</span></li>
                    <li class="order_grand_total total_li">Total: <span class="total">$${totalCost}</span></li>
                </ul>
            </div>
        </div>
        <div class="update_delete_section" id="${id}">
            <button id="_${id}" class="js_update_button report_btn">Update Event</button>
            <button id="?${id}" class="js_delete_button report_btn">Delete Event</button>
        </div>
        
        <div class="update_form" hidden></div>
        `  
    );
}

function displayCreateEventForm(e) {
    e.preventDefault();
    $formContainer.prop('hidden', false);
    $formContainer.show();
    $eventsList.hide();
}

function addFoodInputFields(e) {
    e.preventDefault();
    //if id neccessary for accessibility add counter and use for id/labels
    $foodInput.append(`
        <label class="added_food_input">Food Item:</label>
        <input type="text" class="food_type" name="type">
        <label>Cost Per Item:</label>
        <input type="number" class="food_cost" name="pricePerOrder">
        <label>Quantity</label>
        <input type="number" class="food_quantity" name="quantity">
    `);
}

function addBevInputFields(e) {
    e.preventDefault();
    $bevInput.append(`
    <label class="added_bev_input">Beverage Item:</label>
    <input type="text" class="bev_type" name="type">
    <label for="item_cost">Cost Per Item:</label>
    <input type="number" id="item_cost" class="bev_cost" name="pricePerOrder">
    <label for="bev_quantity">Quantity</label>
    <input type="number" class="bev_quantity" name="quantity">
    `);
}

function getAndDisplayEventReport(e) {
    e.preventDefault();
    displayElements([$eventReport]);
    displayNone([$main]);
    showElements([$eventReport]);
    const id = $(e.target).closest('a').attr('id');
    fetch(`/api/events/${id}`, 'GET', displayEventById);
}

function displayUpdateForm(e) {
    e.preventDefault();
    const id = $(this).attr('id').match(/[a-zA-Z0-9]/g).join('');
    hideElements([$('.event_report_display'), $('.update_delete_section'), $('.report_btn') ]);
    // hideElements([$reportContainer, $updateDeleteContainer, $reportBtn]);
    // $reportContainer.hide();
    showElements([$updateEventForm, $('.update_form')]);
    fetch(`/api/events/${id}`, 'GET', renderUpdateForm);
}

function renderUpdateForm(data) {
    const {id, contact, date, time, order} = data;
    $('.update_form').html(
        `
        <form class="update_event_form">
        <h2 class="form_heading">Update Event</h2>
        <fieldset class="update_field">
            <legend class="update_legend">Contact Information</legend>
            <label for="update_firstName" class="">First Name:</label>
            <input type="text" id="update_firstName" class="" value="${contact.firstName}">
            <label for="update_lastName" class="">Last Name:</label>
            <input type="text" id="update_lastName" class="" value="${contact.lastName}">
            <label for="update_email" class="">Email:</label>
            <input type="text" id="update_email" class="" value="${contact.email}">
            <label for="update_phone" class="">Phone:</label>
            <input type="text" id="update_phone" class="" value="${contact.phone}">
        </fieldset>
        <fieldset class="update_field update_field_gray">
            <legend class="update_legend update_legend_padding">Event Date and Time</legend>
            <label for="update_date">Date:</label>
            <input type="date" id="update_date" class="" value="" required>
            <label for="update_time">Time:</label>
            <input type="time" id="update_time" value="${time}">
        </fieldset>
        <fieldset class="update_field">
            <legend class="update_legend update_legend_border">Food Order</legend>
            <div class="food_order_input2">
                ${order.food.map(item => {return `
                    <label for="update_food_item" class="update_border">Food Item:</label>
                    <input type="text" id="${item._id}" class="food_type" value="${item.type}" name="type">
                    <label for="update_food_cost">Cost Per Item:</label>
                    <input type="number" id="update_food_cost" class="food_cost" value="${item.pricePerOrder}" name="pricePerOrder">
                    <label for="update_food_quantity">Quantity</label>
                    <input type="number" id="update_food_quantity" class="food_quantity" value="${item.quantity}" name="quantity">`
                }).join('')}
            </div>
            <button class="add_food_button update_order_btn">Add More Food</button>
        </fieldset>
        <fieldset class="update_field update_field_gray">
                <legend class="update_legend update_legend_padding">Beverage Order</legend>
                <div class="bev_order_input2">
                    ${order.beverages.map(item => {return `
                    <label for="update_bev_item" class="update_border">Beverage Item:</label>
                    <input type="text" id="${item._id}" class="bev_type" value="${item.type}" name="type">
                    <label for="update_bev_cost">Cost Per Item:</label>
                    <input type="number" id="update_bev_cost" class="bev_cost" value="${item.pricePerOrder}" name="pricePerOrder">
                    <label for="update_bev_quantity">Quantity</label>
                    <input type="number" id="update_bev_quantity" class="bev_quantity" value="${item.quantity}" name="quantity">`
                }).join('')}
                </div>
                <button class="add_bev_button update_order_btn">Add More Beverages</button>
        </fieldset>
        <fieldset class="update_field">
            <legend class="update_legend">Room and Equipment Rental</legend>
            <label for="update_rental_price">Rental Price:</label>
            <input type="number" id="update_rental_price" value="${order.rentalPrice}" required>
        </fieldset>
        <div class="update_btns">
            <button type="submit" class="js_put_btn" id="${id}">Update Event</button>
            <button class="cancel_update_btn">Cancel</button>
        </div>
    </form>
        `
    );
}

function addFoodtoUpdateForm(e) {
        e.preventDefault();
        $('.food_order_input2').append(`
        <label class="added_food_input">Food Item:</label>
        <input type="text" class="food_type" name="type">
        <label>Cost Per Item:</label>
        <input type="number" class="food_cost" name="pricePerOrder">
        <label>Quantity</label>
        <input type="number" class="food_quantity" name="quantity">
        `);
}

function addBevToUpdateForm(e) {
        e.preventDefault();
        $('.bev_order_input2').append(`
        <label class="added_bev_input">Beverage Item:</label>
        <input type="text" class="bev_type" name="type">
        <label>Cost Per Item:</label>
        <input type="number" class="bev_cost" name="pricePerOrder">
        <label>Quantity</label>
        <input type="number" class="bev_quantity" name="quantity">
        `)
}

//creates objects array used for PUT and POST request
function createOrderObjects () {
    let foodObjs = [];
    let bevObjs = [];

    const foodTypes = document.getElementsByClassName('food_type');
    const foodCost = document.getElementsByClassName('food_cost');
    const foodQuantity = document.getElementsByClassName('food_quantity');

    for (let i = 0; i < foodTypes.length; i++){
        let obj = {};
        if (foodTypes[i].id) {
            obj._id = foodTypes[i].id;
        }
        obj.type = foodTypes[i].value;
        obj.pricePerOrder = foodCost[i].value;
        obj.quantity = foodQuantity[i].value;
        
        if (obj.pricePerOrder === '' || obj.quantity === '') {
            continue;
        }else {
            foodObjs.push(obj);
        }
    }

    const bevTypes = document.getElementsByClassName('bev_type');
    const bevCost = document.getElementsByClassName('bev_cost');
    const bevQuantity = document.getElementsByClassName('bev_quantity');
    for (let i = 0; i < bevTypes.length; i++){
        let obj = {};
        if (bevTypes[i].id) {
            obj._id = bevTypes[i].id;
        }
        obj.type = bevTypes[i].value;
        obj.pricePerOrder = bevCost[i].value;
        obj.quantity = bevQuantity[i].value;
        
        if (obj.pricePerOrder === '' || obj.quantity === '') {
            continue;
        }else {
            bevObjs.push(obj);
        }
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
        date: new Date($('#update_date').val()),
        time: $('#update_time').val(),
        order: {
            food: order.foodObjs,
            beverages: order.bevObjs,
            rentalPrice: $('#update_rental_price').val()
        }
    }
    console.log(order.foodObjs);
    fetch(`/api/events/${id}`, 'PUT', getAndDisplayEventTable, eventInfo);
}


function handleDeleteButton(e) {
    e.preventDefault();
    const id = $(this).attr('id').match(/[a-zA-Z0-9]/g).join('');
    fetch(`/api/events/${id}`, 'DELETE', refreshEventsPage);
}

function handleCreateButton(e) {
    e.preventDefault();
    const order = createOrderObjects();
    const eventInfo = {
        contact: {
            firstName: $formFirstNameInput.val(),
            lastName: $formLastNameInput.val(),
            email: $formEmailInput.val(),
            phone: $formPhoneInput.val()
        },
        date: new Date($formDateInput.val()),
        time: $formTimeInput.val(),
        order: {
            food: order.foodObjs,
            beverages: order.bevObjs,
            rentalPrice: $formRentalInput.val()
        }
    };
    fetch('/api/events', 'POST', refreshEventsPage, eventInfo);

    $resetAnchor[0].reset();
}

getAndDisplayEventTable();