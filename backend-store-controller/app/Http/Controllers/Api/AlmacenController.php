<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Almacen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AlmacenController extends Controller
{
    /**
     * Display a listing of all almacenes for a user.
     */
    public function viewAllAlmacenes($id_usuario){
        $almacenes = Almacen::where('id_usuario', $id_usuario)->get();

        $data = [
            'almacenes' => $almacenes,
            'status' => 200
        ];

        return response()->json($data, 200);
    }

    /**
     * Display the specified almacen.
     */
    public function viewOneAlmacen($id){
        $almacen = Almacen::find($id);
        if (!$almacen) {
            $data = [
                'message' => 'No se ha encontrado el almacen',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'almacen' => $almacen,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    /**
     * Create a new almacen.
     */
    public function createAlmacen(Request $request){
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'image' => 'nullable',
            'descripcion' => 'nullable',
            'id_usuario' => 'required|exists:usuario,id'
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error en la validación de los datos',
                'errors' => $validator->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $almacen = Almacen::create([
            'name' => $request->name,
            'image' => $request->imagen,
            'descripcion' => $request->descripcion,
            'id_usuario' => $request->id_usuario
        ]);

        if (!$almacen) {
            $data = [
                'message' => 'Error al crear el almacen',
                'status' => 500
            ];
            return response()->json($data, 500);
        }

        $data = [
            'almacen' => $almacen,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    /**
     * Delete the specified almacen.
     */
    public function deleteAlmacen($id){
        $almacen = Almacen::find($id);

        if (!$almacen) {
            $data = [
                'message' => 'No se ha encontrado el almacen',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $almacen->delete();
        $data = [
            'message' => 'Almacen eliminado',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    /**
     * Update the specified almacen.
     */
    public function updateAlmacen(Request $request, $id){
        $almacen = Almacen::find($id);
        if (!$almacen) {
            $data = [
                'message' => 'No se ha encontrado el almacen',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'image' => 'nullable',
            'descripcion' => 'nullable'
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error en la validación de los datos',
                'errors' => $validator->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $almacen->name = $request->name;
        $almacen->image = $request->imagen;
        $almacen->descripcion = $request->descripcion;
        $almacen->save();

        $data = [
            'almacen' => $almacen,
            'message' => 'Almacen actualizado correctamente',
            'status' => 200
        ];
        return response()->json($data, 200);
    }
}
