<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\usuarioController;
use App\Http\Controllers\Api\AlmacenController;
use App\Http\Controllers\Api\ArmarioController;
use App\Http\Controllers\Api\ProductoController;

// Usuario routes
Route::post('/register', [usuarioController::class, 'createUser']);
Route::post('/login', [usuarioController::class, 'login']);
Route::post('/forgot-password', [usuarioController::class, 'forgotPassword']);
Route::post('/reset-password', [usuarioController::class, 'resetPassword']);



// Protected routes
    
    // Usuario routes
    Route::get('/users', [usuarioController::class, 'viewAllUser']);
    Route::get('/users/{email}', [usuarioController::class, 'viewOneUser']);
    Route::put('/users/{id}', [usuarioController::class, 'updateUser']);
    Route::delete('/users/{id}', [usuarioController::class, 'deleteUser']);
    Route::post('/logout', [usuarioController::class, 'logout']);

    // Almacen routes
    Route::get('/almacenes/user/{id_usuario}', [AlmacenController::class, 'viewAllAlmacenes']);
    Route::get('/almacenes/{id}', [AlmacenController::class, 'viewOneAlmacen']);
    Route::post('/almacenes', [AlmacenController::class, 'createAlmacen']);
    Route::put('/almacenes/{id}', [AlmacenController::class, 'updateAlmacen']);
    Route::delete('/almacenes/{id}', [AlmacenController::class, 'deleteAlmacen']);

    // Armario routes
    Route::get('/armarios/almacen/{id_almacen}', [ArmarioController::class, 'viewAllArmarios']);
    Route::get('/armarios/{id}', [ArmarioController::class, 'viewOneArmario']);
    Route::post('/armarios', [ArmarioController::class, 'createArmario']);
    Route::put('/armarios/{id}', [ArmarioController::class, 'updateArmario']);
    Route::delete('/armarios/{id}', [ArmarioController::class, 'deleteArmario']);

    // Producto routes
    Route::get('/productos/armario/{id_armario}', [ProductoController::class, 'viewAllProductos']);
    Route::get('/productos/{id}', [ProductoController::class, 'viewOneProducto']);
    Route::post('/productos', [ProductoController::class, 'createProducto']);
    Route::put('/productos/{id}', [ProductoController::class, 'updateProducto']);
    Route::delete('/productos/{id}', [ProductoController::class, 'deleteProducto']);



// PETICIONES DE USUARIOS
// Route::get("/users/", [usuarioController::class, 'viewAllUser']); // Listado de usuarios
// Route::get("/users/{id}", [usuarioController::class, 'viewOneUser']); // Peticion de un usuario por id
// Route::post("/users", [usuarioController::class, 'createUser']); // Crear un usuario
// Route::put("/users/{id}", [usuarioController::class, 'updateUser']); // Actualizar un usuario
// Route::delete("/users/{id}", [usuarioController::class, 'deleteUser']);  // Eliminar un usuario

// ARMARIOS
// Route::get("/armarios/", function () {  return "peticion de armarios"; });
// Route::get("/armarios/{id}", function () {  return "peticion de armarios por id"; });
// Route::post("/armarios", function () { return "peticion de armarios para crear"; });
// Route::put("/armarios/{id}", function () {  return "peticion de armarios para actualizar"; });
// Route::delete("/armarios/{id}", function () {   return "peticion de armarios para eliminar"; });

// ALMACENES
// Route::get("/almacenes/", function () { return "peticion de almacenes"; });
// Route::get("/almacenes/{id}", function () { return "peticion de almacenes por id"; });
// Route::post("/almacenes", function () { return "peticion de almacenes para crear"; });
// Route::put("/almacenes/{id}", function () { return "peticion de almacenes para actualizar"; });

// PRODUCTOS
// Route::get("/productos/", function () { return "peticion de productos"; });
// Route::get("/productos/{id}", function () { return "peticion de productos por id"; });
// Route::post("/productos", function () { return "peticion de productos para crear"; });
// Route::put("/productos/{id}", function () { return "peticion de productos para actualizar"; });
// Route::delete("/productos/{id}", function () {  return "peticion de productos para eliminar"; });
