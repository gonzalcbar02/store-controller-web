<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Armario extends Model
{
    use HasFactory;

    protected $table = 'armarios';

    protected $fillable = [
      'name',
      'descripcion',
      'id_almacen'
    ];

}
