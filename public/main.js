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
    $('.dynamic_food_inputs').html('');
    $('.dynamic_bev_inputs').html('');
    $resetAnchor[0].reset();
    $eventTable.html('');
    getAndDisplayEventTable();
}

function displayAllEvents(data) {
    for(let i = 0; i < data.length; i++) {
        renderEventRow(data[i]);
        console.log(data[i]);
    }
}

function renderTableHeading() {
    $('.event_table').html(`
    <tr>
        <th>Contact</th>
        <th>Event Date</th>
        <th>Total</th>
        <th>Invoice</th>
    </tr>
    `)
}

function renderEventRow(data) {
    const {id, contact, date, order} = data;
    let foodTotalCost = order.food.map((index)=> index.pricePerOrder * index.quantity).reduce((a, b) => {return a+b});
    let bevTotalCost = order.beverages.map((index)=> index.pricePerOrder * index.quantity).reduce((a, b) => {return a+b});
    let totalCost = foodTotalCost + bevTotalCost + order.rentalPrice;
    const eventDate = date.replace(/T.*$/,"");
    $('.event_table').append(
        `
            <tr class="table_row">
                <td class="table_td"><span class="row_list_category"></span> ${contact.lastName}, ${contact.firstName}</td>
                <td class="table_td"><span class="row_list_category"></span> ${eventDate}</td>
                <td class="table_td"><span class="row_list_category"></span> $${totalCost}</td>
                <td class="event_report_path table_td"><a href="#" id="${id}" class="event_id">View Invoice</a></td>
            </tr>
        `
    );
}

function getAndDisplayEventTable() {
    renderTableHeading();
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
                <p>Invoice For: ${contact.firstName} ${contact.lastName}</p>
                <p>email: ${contact.email}</p>
                <p>phone: ${contact.phone}</p>
            </div>
            <div class="report_invoice">
                <div class="invoice_order">
                    <h3 class="invoice_order_head">Food</h3>
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
                    <h3 class="invoice_order_head">Beverages</h3>
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
                </div>
                <ul class="order_totals">
                    <li class="total_li">Food Total: <span class="total">$${foodTotalCost}</span></li>
                    <li class="total_li">Beverage Total: <span class="total">$${bevTotalCost}</span></li>
                    <li class="total_li total_border">Rental Price: <span class="total">$${order.rentalPrice}</span></li>
                    <li class="order_grand_total total_li">Amount Due: <span class="total">$${totalCost}</span></li>
                </ul>
            </div>
        </div>
        <div class="update_delete_section" id="${id}">
            <button id="_${id}" class="js_update_button report_btn green font_white">Update Event</button>
            <button id="?${id}" class="js_delete_button report_btn font_white">Delete Event</button>
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
    $('.dynamic_food_inputs').append(`
    <div class="food_input_group">
        <label for="food_type" class="added_input"><span>Food Item</span>
            <input type="text" class="food_type" name="type" required>
        </label>
        <label for="food_cost"><span>Item Cost</span>
            <input type="number" class="food_cost" name="pricePerOrder" required>
        </label>
        <label for="food_quantity"><span>Quantity</span>
            <input type="number" class="food_quantity" name="quantity" required>
        </label>
    </div>
    `);
}

function addBevInputFields(e) {
    e.preventDefault();
    $('.dynamic_bev_inputs').append(`
    <div class="bev_input_group">
        <label for="bev_type" class="added_input"><span>Beverage Item</span>
            <input type="text" class="bev_type" name="type" required>
        </label>
        <label for="bev_cost"><span>Item Cost</span>
            <input type="number" class="bev_cost" name="pricePerOrder" required>
        </label>
        <label for="bev_quantity"><span>Quantity</span>
            <input type="number" class="bev_quantity" name="quantity" required>
        </label>
    </div>
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
            <label for="update_firstName" class=""><span>First Name</span>
                <input type="text" id="update_firstName" class="" value="${contact.firstName}">
            </label>
            <label for="update_lastName" class=""><span>Last Name</span>
                <input type="text" id="update_lastName" class="" value="${contact.lastName}">
            </label>
            <label for="update_email" class=""><span>Email</span>
                <input type="text" id="update_email" class="" value="${contact.email}">
            </label>
            <label for="update_phone" class=""><span>Phone</span>
                <input type="text" id="update_phone" class="" value="${contact.phone}">
            </label>
        </fieldset>
        <fieldset class="update_field update_field_gray">
            <legend class="update_legend update_legend_padding">Event Date and Time</legend>
            <label for="update_date"><span>Date</span>
                <input type="date" id="update_date" class="" value="" required>
            </label>
            <label for="update_time"><span>Time</span>
                <input type="time" id="update_time" value="${time}">
            </label>
        </fieldset>
        <fieldset class="update_field">
            <legend class="update_legend update_legend_border">Food Order</legend>
            <div class="food_order_input2">
                ${order.food.map(item => {return `
                    <div class="food_input_group">
                        <label for="update_food_item" class="update_border"><span>Item</span>
                            <input type="text" id="${item._id}" class="food_type" value="${item.type}" name="type">
                        </label>
                        <label for="update_food_cost"><span>Item Cost</span>
                            <input type="number" id="update_food_cost" class="food_cost" value="${item.pricePerOrder}" name="pricePerOrder">
                        </label>
                        <label for="update_food_quantity"><span>Quantity</span>
                            <input type="number" id="update_food_quantity" class="food_quantity" value="${item.quantity}" name="quantity">
                        </label>
                    </div>
                    `
                }).join('')}
            </div>
            <button class="add_food_button update_order_btn green font_white">Add Food</button>
        </fieldset>
        <fieldset class="update_field update_field_gray">
                <legend class="update_legend update_legend_padding">Beverage Order</legend>
                <div class="bev_order_input2">
                    ${order.beverages.map(item => {return `
                    <div class="bev_input_group">
                        <label for="update_bev_item" class="update_border"><span>Item</span>
                            <input type="text" id="${item._id}" class="bev_type" value="${item.type}" name="type">
                        </label>
                        <label for="update_bev_cost"><span>Item Cost</span>
                            <input type="number" id="update_bev_cost" class="bev_cost" value="${item.pricePerOrder}" name="pricePerOrder">
                        </label>
                        <label for="update_bev_quantity"><span>Quantity</span>
                            <input type="number" id="update_bev_quantity" class="bev_quantity" value="${item.quantity}" name="quantity">
                        </label>
                    </div>
                    `
                }).join('')}
                </div>
                <button class="add_bev_button update_order_btn green font_white">Add Beverage</button>
        </fieldset>
        <fieldset class="update_field">
            <legend class="update_legend">Room and Equipment Rental</legend>
            <label for="update_rental_price"><span>Rental Price</span>
                <input type="number" id="update_rental_price" value="${order.rentalPrice}" required>
            </label>
        </fieldset>
        <div class="update_btns">
            <button type="submit" class="js_put_btn green font_white" id="${id}">Update Event</button>
            <button class="cancel_update_btn font_white">Cancel</button>
        </div>
    </form>
        `
    );
}

function addFoodtoUpdateForm(e) {
        e.preventDefault();
        $('.food_order_input2').append(`
        <div class="food_input_group">
            <label for="food_type" class="added_input"><span>Food Item</span>
                <input type="text" class="food_type" name="type" required>
            </label>
            <label for="food_cost"><span>Item Cost</span>
                <input type="number" class="food_cost" name="pricePerOrder" required>
            </label>
            <label for="food_quantity"><span>Quantity</span>
                <input type="number" class="food_quantity" name="quantity" required>
            </label>
        </div>
        `);
}

function addBevToUpdateForm(e) {
        e.preventDefault();
        $('.bev_order_input2').append(`
        <div class="bev_input_group">
            <label for="bev_type" class="added_input"><span>Beverage Item</span>
                <input type="text" class="bev_type" name="type" required>
            </label>
            <label for="bev_cost"><span>Item Cost</span>
                <input type="number" class="bev_cost" name="pricePerOrder" required>
            </label>
            <label for="bev_quantity"><span>Quantity</span>
                <input type="number" class="bev_quantity" name="quantity" required>
            </label>
        </div>
        `)
}

function handleUpdateSubmit(e) {
    e.preventDefault();
    // const order = createOrderObjects();
    let foodObjs = [];
    let bevObjs = [];

    $(this).find('.food_input_group').each(function() {
        const inputs = $(this).find('input');
        const object = {};
        Object.values(inputs).forEach(input => {
            if (input.localName === 'input' && input.value !== "") {
                object[input.name] = input.value
            }
        });
        foodObjs.push(object);
    });
    
    $(this).find('.bev_input_group').each(function() {
        const inputs = $(this).find('input');
        const object = {};
        Object.values(inputs).forEach(input => {
            if (input.localName === 'input' && input.value !== "") {
                object[input.name] = input.value
            }
        });
        bevObjs.push(object);
    });

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
            food: foodObjs,
            beverages: bevObjs,
            rentalPrice: $('#update_rental_price').val()
        }
    }
    // console.log(order.foodObjs);
    fetch(`/api/events/${id}`, 'PUT', getAndDisplayEventTable, eventInfo);
}


function handleDeleteButton(e) {
    e.preventDefault();
    const id = $(this).attr('id').match(/[a-zA-Z0-9]/g).join('');
    fetch(`/api/events/${id}`, 'DELETE', refreshEventsPage);
}

function handleCreateButton(e) {
    e.preventDefault();
    // const order = createOrderObjects();
    let foodObjs = [];
    let bevObjs = [];

    $(this).find('.food_input_group').each(function() {
        const inputs = $(this).find('input');
        const object = {};
        Object.values(inputs).forEach(input => {
            if (input.localName === 'input' && input.value !== "") {
                object[input.name] = input.value
            }
        });
        foodObjs.push(object);
    });
    
    $(this).find('.bev_input_group').each(function() {
        const inputs = $(this).find('input');
        const object = {};
        Object.values(inputs).forEach(input => {
            if (input.localName === 'input' && input.value !== "") {
                object[input.name] = input.value
            }
        });
        bevObjs.push(object);
    });

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
            food: foodObjs,
            beverages: bevObjs,
            rentalPrice: $formRentalInput.val()
        }
    };
    fetch('/api/events', 'POST', refreshEventsPage, eventInfo);

    $resetAnchor[0].reset();
}

getAndDisplayEventTable();