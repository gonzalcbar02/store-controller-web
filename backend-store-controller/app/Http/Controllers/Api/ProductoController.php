<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Producto;
use Illuminate\Support\Facades\Validator;

class ProductoController extends Controller
{
    /**
     * Display a listing of all productos for an armario.
     */
    public function viewAllProductos($id_armario){
        $productos = Producto::where('id_armario', $id_armario)->get();

        $data = [
            'productos' => $productos,
            'status' => 200
        ];
        
        return response()->json($data, 200);
    }

    /**
     * Display the specified producto.
     */
    public function viewOneProducto($id){
        $producto = Producto::find($id);
        if (!$producto) {
            $data = [
                'message' => 'No se ha encontrado el producto',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'producto' => $producto,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    /**
     * Create a new producto.
     */
    public function createProducto(Request $request){
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'image' => 'nullable',
            'descripcion' => 'nullable',
            'id_armario' => 'required|exists:armarios,id'
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error en la validación de los datos',
                'errors' => $validator->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $producto = Producto::create([
            'name' => $request->name,
            'image' => $request->imagen,
            'descripcion' => $request->descripcion,
            'id_armario' => $request->id_armario
        ]);

        if (!$producto) {
            $data = [
                'message' => 'Error al crear el producto',
                'status' => 500
            ];
            return response()->json($data, 500);
        }

        $data = [
            'producto' => $producto,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    /**
     * Delete the specified producto.
     */
    public function deleteProducto($id){
        $producto = Producto::find($id);

        if (!$producto) {
            $data = [
                'message' => 'No se ha encontrado el producto',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $producto->delete();
        $data = [
            'message' => 'Producto eliminado',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    /**
     * Update the specified producto.
     */
    public function updateProducto(Request $request, $id){
        $producto = Producto::find($id);
        if (!$producto) {
            $data = [
                'message' => 'No se ha encontrado el producto',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'image' => 'nullable',
            'descripcion' => 'nullable',
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error en la validación de los datos',
                'errors' => $validator->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $producto->name = $request->name;
        $producto->image = $request->imagen;
        $producto->descripcion = $request->descripcion;
        $producto->save();

        $data = [
            'producto' => $producto,
            'message' => 'Producto actualizado correctamente',
            'status' => 200
        ];
        return response()->json($data, 200);
    }
}
