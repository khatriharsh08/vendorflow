<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorState extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'is_terminal',
        'sort_order',
    ];

    protected $casts = [
        'is_terminal' => 'boolean',
    ];
}
