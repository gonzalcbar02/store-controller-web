<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Usuario;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class usuarioController extends Controller
{
    /**
     * Display a listing of all users.
     */
    public function viewAllUser()
    {
        $usuarios = Usuario::all();

        $data = [
            'usuarios' => $usuarios,
            'status' => 200
        ];

        return response()->json($data, 200);
    }

    /**
     * Display the specified user.
     */
    public function viewOneUser($email)
    {
        $user = Usuario::where('email',$email)->first();
        if (!$user) {
            $data = [
                'message' => 'No se ha encontrado el usuario',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'user' => $user,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    /**
     * Register a new user.
     */
    public function createUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nickname' => 'required|unique:usuario',
            'email' => 'required|email|unique:usuario',
            'password' => 'required|min:6'
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error en la validación de los datos',
                'errors' => $validator->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $user = Usuario::create([
            'nickname' => $request->nickname,
            'email' => $request->email,
            'password' => Hash::make($request->password)
        ]);

        if (!$user) {
            $data = [
                'message' => 'Error al crear al usuario',
                'status' => 500
            ];
            return response()->json($data, 500);
        }

        $data = [
            'user' => $user,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    /**
     * Delete the specified user.
     */
    public function deleteUser($id){
        $user = Usuario::find($id);

        if (!$user) {
            $data = [
                'message' => 'No se ha encontrado el usuario',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $user->delete();
        $data = [
            'message' => 'Usuario eliminado',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    /**
     * Update the specified user.
     */
    public function updateUser(Request $request, $id)
    {
        $user = Usuario::find($id);
        if (!$user) {
            $data = [
                'message' => 'No se ha encontrado el usuario',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $validator = Validator::make($request->all(), [
            'nickname' => 'required|unique:usuario,nickname,' . $id,
            'email' => 'required|email|unique:usuario,email,' . $id,
            'password' => 'sometimes|min:6'
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error en la validación de los datos',
                'errors' => $validator->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $user->nickname = $request->nickname;
        $user->email = $request->email;

        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        $data = [
            'user' => $user,
            'message' => 'Usuario actualizado correctamente',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    /**
     * Login user.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error en la validación de los datos',
                'errors' => $validator->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $user = Usuario::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            $data = [
                'message' => 'Credenciales incorrectas',
                'status' => 401
            ];
            return response()->json($data, 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $data = [
            'user' => $user,
            'token' => $token,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    /**
     * Logout user.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        $data = [
            'message' => 'Sesión cerrada correctamente',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    /**
     * Send password reset link.
     */
    public function forgotPassword(Request $request){
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:usuario,email'
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error en la validación de los datos',
                'errors' => $validator->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        // Configurar el broker de contraseñas para usar tu modelo Usuario
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            $data = [
                'message' => 'Se ha enviado un enlace de recuperación a tu email.',
                'status' => 200
            ];
            return response()->json($data, 200);
        }

        $data = [
            'message' => 'Error al enviar el enlace de restablecimiento. Verifica que el email esté registrado.',
            'status' => 500
        ];
        return response()->json($data, 500);
    }

     public function resetPassword(Request $request)
    {
        
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:usuario,email', 
            'password' => 'required|min:6|confirmed',       
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación.',
                'errors' => $validator->errors(),
                'status' => 422, 
            ], 422);
        }

        try {
            
            $user = Usuario::where('email', $request->email)->first();

           
            if (!$user) {
                return response()->json([
                    'message' => 'No se encontró un usuario con esa dirección de correo electrónico.',
                    'status' => 404, // 404 No Encontrado
                ], 404);
            }

            // 3. Actualizar la contraseña del usuario
            $user->password = Hash::make($request->password);

            $user->save();

            // 4. Respuesta de éxito
            return response()->json([
                'message' => '¡Contraseña actualizada exitosamente!',
                'status' => 200,
            ], 200);

        } catch (\Exception $e) {
            
            return response()->json([
                'message' => 'Error interno del servidor al intentar actualizar la contraseña.',
                'error_details' => $e->getMessage(), // Solo para depuración, no en producción
                'status' => 500,
            ], 500);
        }
    }
}
