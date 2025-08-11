<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Armario;
use Illuminate\Support\Facades\Validator;

class ArmarioController extends Controller
{
    /**
     * Display a listing of all armarios for an almacen.
     */
    public function viewAllArmarios($id_almacen){
        $armarios = Armario::where('id_almacen', $id_almacen)->get();

        $data = [
            'armarios' => $armarios,
            'status' => 200
        ];
        
        return response()->json($data, 200);
    }

    /**
     * Display the specified armario.
     */
    public function viewOneArmario($id){
        $armario = Armario::find($id);
        if (!$armario) {
            $data = [
                'message' => 'No se ha encontrado el armario',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'armario' => $armario,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    /**
     * Create a new armario.
     */
    public function createArmario(Request $request){
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'descripcion' => 'nullable',
            'id_almacen' => 'required|exists:almacen,id'
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error en la validación de los datos',
                'errors' => $validator->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $armario = Armario::create([
            'name' => $request->name,
            'descripcion' => $request->descripcion,
            'id_almacen' => $request->id_almacen
        ]);

        if (!$armario) {
            $data = [
                'message' => 'Error al crear el armario',
                'status' => 500
            ];
            return response()->json($data, 500);
        }

        $data = [
            'armario' => $armario,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    /**
     * Delete the specified armario.
     */
    public function deleteArmario($id){
        $armario = Armario::find($id);

        if (!$armario) {
            $data = [
                'message' => 'No se ha encontrado el armario',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $armario->delete();
        $data = [
            'message' => 'Armario eliminado',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    /**
     * Update the specified armario.
     */
    public function updateArmario(Request $request, $id){
        $armario = Armario::find($id);
        if (!$armario) {
            $data = [
                'message' => 'No se ha encontrado el armario',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required',
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

        $armario->name = $request->name;
        $armario->descripcion = $request->descripcion;
        $armario->save();

        $data = [
            'armario' => $armario,
            'message' => 'Armario actualizado correctamente',
            'status' => 200
        ];
        return response()->json($data, 200);
    }
}
