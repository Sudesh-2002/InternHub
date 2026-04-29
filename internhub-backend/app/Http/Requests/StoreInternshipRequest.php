<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInternshipRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Only authenticated companies may post
        return auth()->check() && auth()->user()->role === 'company';
    }

    public function rules(): array
    {
        return [
            'title'        => ['required', 'string', 'max:255'],
            'description'  => ['required', 'string'],
            'location'     => ['required', 'string', 'max:255'],
            'type'         => ['required', 'in:Remote,On-site,Hybrid'],
            'salary'       => ['nullable', 'string', 'max:100'],
            'deadline'     => ['nullable', 'date', 'after:today'],
            'requirements' => ['nullable', 'string'],
            'duration'     => ['nullable', 'string', 'max:100'],
            'vacancies'    => ['nullable', 'integer', 'min:1', 'max:999'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'       => 'Job title is required.',
            'description.required' => 'Description is required.',
            'location.required'    => 'Location is required.',
            'type.in'              => 'Work type must be Remote, On-site, or Hybrid.',
            'deadline.after'       => 'Deadline must be a future date.',
        ];
    }
}