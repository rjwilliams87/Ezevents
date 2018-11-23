"use strict";

//cache DOM//
const $htmlWrapper = $("#wrapper");

    //menu variables//
const $header = $htmlWrapper.find("header");
const $homeBtn = $header.find("#home_btn");
const $logoutBtn = $header.find("#logout_btn");
const $nav = $header.find("nav");
const $menuToggler = $header.find(".menu_toggle");

    //main, events_display, event_table variables
const $main = $htmlWrapper.find("main");
const $showFormBtn = $main.find(".js_create_event_button");
const $eventTable = $main.find(".event_table");
const $eventsList = $main.find(".events_list");

    //new event form variables//
const $resetAnchor = $htmlWrapper.find("#reset_anchor");
const $formContainer = $htmlWrapper.find(".new_form_container");
const $newEventForm = $formContainer.find(".new_event_form");
const $formTimeInput = $formContainer.find("#event_time");
const $formDateInput = $formContainer.find("#event_date");
const $formFirstNameInput = $formContainer.find("#contact_firstName");
const $formLastNameInput = $formContainer.find("#contact_lastName");
const $formEmailInput = $formContainer.find("#contact_email");
const $formPhoneInput = $formContainer.find("#contact_phone");
const $formRentalInput = $formContainer.find("#event_rental_price");
const $foodInputContainer = $formContainer.find(".dynamic_food_inputs");
const $bevInputContainer = $formContainer.find(".dynamic_bev_inputs");

    //event_report variables//
const $eventReport = $htmlWrapper.find(".event_report");
const $updateForm = $htmlWrapper.find(".update_form");

//bind events//
$homeBtn.on("click", refreshEventsPage);
$logoutBtn.on("click", logout);
$menuToggler.on("click", toggleClass);
$showFormBtn.on("click", displayCreateEventForm);
$newEventForm.on("click", ".add_food_button", addFoodInputFields);
$newEventForm.on("click", ".add_bev_button", addBevInputFields);
$eventTable.on("click", ".event_id", getAndDisplayEventReport);
$eventReport.on("click", ".js_update_button", displayUpdateForm);
$eventReport.on("click", ".js_delete_button", handleDeleteButton);
$updateForm.on("submit", handleUpdateSubmit);
$updateForm.on("click", ".cancel_update_btn", refreshEventsPage);
$updateForm.on("click", ".add_food_button", addFoodtoUpdateForm);
$updateForm.on("click", ".add_bev_button", addBevToUpdateForm);
$formContainer.on("submit", handleCreateButton);
$formContainer.on("click", ".cancel_post_button", refreshEventsPage);


//html templates//
const tableTemplate = `
    <tr>
        <th>Contact</th>
        <th>Event Date</th>
        <th>Start Time</th>
        <th>Total</th>
        <th>Invoice</th>
    </tr>  
`;

const foodInputsTemplate = `
    <div class="food_input_group">
        <label for="food_type" class="added_input"><span>Item</span>
            <input type="text" class="food_type" name="type" required>
        </label>
        <label for="food_cost"><span>Item Cost</span>
            <input type="number" class="food_cost" name="pricePerOrder" required>
        </label>
        <label for="food_quantity"><span>Quantity</span>
            <input type="number" class="food_quantity" name="quantity" required>
        </label>
    </div>
`;

const bevInputsTemplate = `
    <div class="bev_input_group">
        <label for="bev_type" class="added_input"><span>Item</span>
            <input type="text" class="bev_type" name="type" required>
        </label>
        <label for="bev_cost"><span>Item Cost</span>
            <input type="number" class="bev_cost" name="pricePerOrder" required>
        </label>
        <label for="bev_quantity"><span>Quantity</span>
            <input type="number" class="bev_quantity" name="quantity" required>
        </label>
    </div>
`

//ajax function
function fetch(url, method, callback, data) {
    const token = localStorage.getItem("authToken");
    const request = {
        url: url,
        method: method,
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(data),
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }
    $.ajax(request).done(callback);
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

function hideElements(elements) {
    elements.forEach(element => {
        element.prop("hidden", true);
    })
}

//nav
function logout(e) {
    e.preventDefault();
    localStorage.removeItem("Bearer")
    window.location.href = "index.html";
}

function toggleClass(e) {
    e.preventDefault();
    $nav.toggleClass("toggle");
}

//nav, cancel btns, delete btns, ajax callback//
function refreshEventsPage() {
    $eventTable.html("");
    $foodInputContainer.html("");
    $bevInputContainer.html("");
    $resetAnchor[0].reset();
    getAndDisplayEventTable();
}

//Home Page
function displayAllEvents(data) {
    for(let i = 0; i < data.length; i++) {
        renderEventRow(data[i]);
        // console.log(data[i]);
    }
}

function renderTableHeading() {
    $eventTable.html(tableTemplate);
}

function renderEventRow(data) {
    const {id, contact, date, time, order} = data;
    let foodTotalCost = order.food.map((index)=> index.pricePerOrder * index.quantity).reduce((a, b) => {return a+b});
    let bevTotalCost = order.beverages.map((index)=> index.pricePerOrder * index.quantity).reduce((a, b) => {return a+b});
    let totalCost = foodTotalCost + bevTotalCost + order.rentalPrice;
    const eventDate = date.replace(/T.*$/,"");
    $eventTable.append(
        `
            <tr class="table_row">
                <td class="table_td"><span class="row_list_category"></span> ${contact.lastName}, ${contact.firstName}</td>
                <td class="table_td"><span class="row_list_category"></span> ${eventDate}</td>
                <td class="table_td"><span class="row_list_category"></span> ${time}</td>
                <td class="table_td"><span class="row_list_category"></span> $${totalCost}</td>
                <td class="event_report_path table_td"><a href="#" id="${id}" class="event_id">View Invoice</a></td>
            </tr>
        `
    );
}

function getAndDisplayEventTable() {
    renderTableHeading();
    displayNone([$eventReport, $updateForm, $formContainer]);
    displayElements([$main, $eventsList, $eventTable]);
    fetch("/api/events", "GET", displayAllEvents);
}

// create new event form //
function displayCreateEventForm(e) {
    e.preventDefault();
    $formContainer.prop("hidden", false);
    $formContainer.show();
    $eventsList.hide();
}

function addFoodInputFields(e) {
    e.preventDefault();
    $foodInputContainer.append(foodInputsTemplate);
}

function addBevInputFields(e) {
    e.preventDefault();
    $bevInputContainer.append(bevInputsTemplate);
}

function handleCreateButton(e) {
    e.preventDefault();
    let foodObjs = [];
    let bevObjs = [];

    $(this).find(".food_input_group").each(function() {
        const inputs = $(this).find("input");
        const object = {};
        Object.values(inputs).forEach(input => {
            if (input.localName === "input" && input.value !== "") {
                object[input.name] = input.value
            }
        });
        foodObjs.push(object);
    });
    
    $(this).find(".bev_input_group").each(function() {
        const inputs = $(this).find("input");
        const object = {};
        Object.values(inputs).forEach(input => {
            if (input.localName === "input" && input.value !== "") {
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
    fetch("/api/events", "POST", refreshEventsPage, eventInfo);

    $resetAnchor[0].reset();
}

// event invoice/report //
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
            <div class="invoice_head">
                <div class="report_contact">
                    <p>Invoice For: ${contact.firstName} ${contact.lastName}</p>
                    <p>email: ${contact.email}</p>
                    <p>phone: ${contact.phone}</p>
                </div>
            </div>
            <div class="report_invoice">
                <div class="invoice_order">
                    <h2 class="invoice_order_head">Food</h2>
                    ${order.food.map(item => {return `
                    <div class="">
                        <ul class="order_grouping">
                            <li class="item_name order_li"><span class="item_name">Item:</span> ${item.type}</li>
                            <li class="order_li"><span>Cost per item:</span> ${item.pricePerOrder}</li>
                            <li class="order_li"><span>Quantity:</span> ${item.quantity}</li>
                            <li class="order_li"><span>Order Price:</span> $${JSON.parse(item.pricePerOrder) * JSON.parse(item.quantity)}</li>
                        </ul>
                    </div>
                    `}).join("")}
                    <h2 class="invoice_order_head">Beverages</h2>
                    ${order.beverages.map(item => {return `
                    <div class="">
                        <ul class="order_grouping">
                            <li class="item_name order_li"><span>Item:</span> ${item.type}</li>
                            <li class="order_li"><span>Cost per item:</span> ${item.pricePerOrder}</li>
                            <li class="order_li"><span>Quantity:</span> ${item.quantity}</li>
                            <li class="order_li"><span>Order Price:</span> $${JSON.parse(item.pricePerOrder) * JSON.parse(item.quantity)}</li>
                        </ul>
                    </div>
                    `}).join("")}
                </div>
                <h2 class="invoice_order_head total_header">Total</h2>
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
        `  
    );
}

function getAndDisplayEventReport(e) {
    e.preventDefault();
    $main.hide();
    $eventReport.show();
    const id = $(e.target).closest("a").attr("id");
    fetch(`/api/events/${id}`, "GET", displayEventById);
}

function handleDeleteButton(e) {
    e.preventDefault();
    const id = $(this).attr("id").match(/[a-zA-Z0-9]/g).join("");
    fetch(`/api/events/${id}`, "DELETE", refreshEventsPage);
}

//update form//

//update to html in order cache these dynamic elements 
//planned for coming update

function displayUpdateForm(e) {
    e.preventDefault();
    const id = $(this).attr("id").match(/[a-zA-Z0-9]/g).join("");
    $eventReport.hide();
    $updateForm.show();
    fetch(`/api/events/${id}`, "GET", renderUpdateForm);
}

function renderUpdateForm(data) {
    const {id, contact, date, time, order} = data;
    $updateForm.html(
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
            <div class="food_order_input2" aria-live="assertive">
                ${order.food.map(item => {return `
                    <div class="food_input_group">
                        <label for="food_item" class="update_border"><span>Item</span>
                            <input type="text" id="${item._id}" class="food_type" value="${item.type}" name="type">
                        </label>
                        <label for="food_cost"><span>Item Cost</span>
                            <input type="number" class="food_cost" value="${item.pricePerOrder}" name="pricePerOrder">
                        </label>
                        <label for="food_quantity"><span>Quantity</span>
                            <input type="number" class="food_quantity" value="${item.quantity}" name="quantity">
                        </label>
                    </div>
                    `
                }).join("")}
            </div>
            <button class="add_food_button update_order_btn green font_white">Add Food</button>
        </fieldset>
        <fieldset class="update_field update_field_gray">
                <legend class="update_legend update_legend_padding">Beverage Order</legend>
                <div class="bev_order_input2" aria-live="assertive">
                    ${order.beverages.map(item => {return `
                    <div class="bev_input_group">
                        <label for="update_bev_item" class="update_border"><span>Item</span>
                            <input type="text" id="${item._id}" class="bev_type" value="${item.type}" name="type">
                        </label>
                        <label for="=bev_cost"><span>Item Cost</span>
                            <input type="number" class="bev_cost" value="${item.pricePerOrder}" name="pricePerOrder">
                        </label>
                        <label for="bev_quantity"><span>Quantity</span>
                            <input type="number" class="bev_quantity" value="${item.quantity}" name="quantity">
                        </label>
                    </div>
                    `
                }).join("")}
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
        $(".food_order_input2").append(foodInputsTemplate);
}

function addBevToUpdateForm(e) {
        e.preventDefault();
        $(".bev_order_input2").append(bevInputsTemplate)
}

function handleUpdateSubmit(e) {
    e.preventDefault();
    let foodObjs = [];
    let bevObjs = [];

    $(this).find(".food_input_group").each(function() {
        const inputs = $(this).find("input");
        const object = {};
        Object.values(inputs).forEach(input => {
            if (input.localName === "input" && input.value !== "") {
                object[input.name] = input.value
            }
        });
        foodObjs.push(object);
    });
    
    $(this).find(".bev_input_group").each(function() {
        const inputs = $(this).find("input");
        const object = {};
        Object.values(inputs).forEach(input => {
            if (input.localName === "input" && input.value !== "") {
                object[input.name] = input.value
            }
        });
        bevObjs.push(object);
    });

    const id = $(".js_put_btn").attr("id");
    const eventInfo = {
        id: id,
        contact: {
            firstName: $("#update_firstName").val(),
            lastName: $("#update_lastName").val(),
            email: $("#update_email").val(),
            phone: $("#update_phone").val()
        },
        date: new Date($("#update_date").val()),
        time: $("#update_time").val(),
        order: {
            food: foodObjs,
            beverages: bevObjs,
            rentalPrice: $("#update_rental_price").val()
        }
    }
    // console.log(order.foodObjs);
    fetch(`/api/events/${id}`, "PUT", getAndDisplayEventTable, eventInfo);
}

getAndDisplayEventTable();