<?php
namespace App\Http\Controllers;

use App\Models\CompanyProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class CompanyProfileController extends Controller
{
    public function show()
    {
        $profile = CompanyProfile::where('user_id', Auth::id())->first();

        if (!$profile) {
            return response()->json(['data' => null], 200);
        }

        return response()->json([
            'data' => $this->formatProfile($profile),
        ]);
    }

    // Handles both create and full update (upsert)
    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());

        // FIX: use updateOrCreate so user_id is always set correctly
        $profile = CompanyProfile::firstOrNew(['user_id' => Auth::id()]);
        $profile->user_id = Auth::id(); // ← explicitly set BEFORE fill

        $profile->fill($validated);

        if ($request->hasFile('logo')) {
            $this->deleteOldFile($profile->logo_path);
            $profile->logo_path = $request->file('logo')
                ->store('company/logos', 'public');
        }

        if ($request->hasFile('business_cert')) {
            $this->deleteOldFile($profile->business_cert_path);
            $profile->business_cert_path = $request->file('business_cert')
                ->store('company/docs', 'public');
        }

        if ($request->hasFile('tax_docs')) {
            $this->deleteOldFile($profile->tax_docs_path);
            $profile->tax_docs_path = $request->file('tax_docs')
                ->store('company/docs', 'public');
        }

        if ($request->hasFile('verification_doc')) {
            $this->deleteOldFile($profile->verification_doc_path);
            $profile->verification_doc_path = $request->file('verification_doc')
                ->store('company/docs', 'public');
        }

        if ($request->hasFile('hr_auth')) {
            $this->deleteOldFile($profile->hr_auth_path);
            $profile->hr_auth_path = $request->file('hr_auth')
                ->store('company/docs', 'public');
        }

        $profile->save();

        return response()->json([
            'message' => 'Company profile saved successfully.',
            'data'    => $this->formatProfile($profile),
        ], 200);
    }

    // Partial update — useful if the frontend saves one step at a time
    public function update(Request $request)
    {
        $profile = CompanyProfile::where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate($this->rules(partial: true));
        $profile->fill($validated);

        // File fields — same logic as store()
        $fileMap = [
            'logo'             => 'logo_path',
            'business_cert'    => 'business_cert_path',
            'tax_docs'         => 'tax_docs_path',
            'verification_doc' => 'verification_doc_path',
            'hr_auth'          => 'hr_auth_path',
        ];

        foreach ($fileMap as $inputName => $column) {
            if ($request->hasFile($inputName)) {
                $this->deleteOldFile($profile->$column);
                $folder = $inputName === 'logo' ? 'company/logos' : 'company/docs';
                $profile->$column = $request->file($inputName)
                    ->store($folder, 'public');
            }
        }

        $profile->save();

        return response()->json([
            'message' => 'Company profile updated successfully.',
            'data'    => $this->formatProfile($profile),
        ]);
    }

    private function rules(bool $partial = false): array
    {
        $sometimes = $partial ? 'sometimes|' : '';

        return [
            // Identity
            'company_name'    => $sometimes . 'required|string|max:255',
            'registered_name' => 'nullable|string|max:255',
            'industry'        => 'nullable|string|max:100',
            'registration_no' => 'nullable|string|max:100',
            'year_founded'    => 'nullable|integer|min:1900|max:2099',
            'company_size'    => 'nullable|string|max:50',
            'headquarters'    => 'nullable|string|max:255',
            'website'         => 'nullable|url|max:255',

            // Description
            'about'           => 'nullable|string',
            'mission'         => 'nullable|string',
            'vision'          => 'nullable|string',
            'services'        => 'nullable|string',
            'technologies'    => 'nullable|string',
            'culture'         => 'nullable|string',

            // Contact
            'official_email'  => 'nullable|email|max:255',
            'hr_email'        => 'nullable|email|max:255',
            'phone'           => 'nullable|string|max:30',
            'address'         => 'nullable|string',
            'linkedin_url'    => 'nullable|url|max:255',
            'facebook_url'    => 'nullable|url|max:255',

            // Files
            'logo'             => 'nullable|image|mimes:jpeg,png,svg|max:2048',
            'business_cert'    => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'tax_docs'         => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'verification_doc' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'hr_auth'          => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ];
    }

    private function deleteOldFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function formatProfile(CompanyProfile $profile): array
    {
        return [
            'id'               => $profile->id,

            // Identity
            'logo_url'         => $profile->logo_url,
            'company_name'     => $profile->company_name,
            'registered_name'  => $profile->registered_name,
            'industry'         => $profile->industry,
            'registration_no'  => $profile->registration_no,
            'year_founded'     => $profile->year_founded,
            'company_size'     => $profile->company_size,
            'headquarters'     => $profile->headquarters,
            'website'          => $profile->website,
            'verification_status' => $profile->verification_status ?? 'pending',

            // Description
            'about'            => $profile->about,
            'mission'          => $profile->mission,
            'vision'           => $profile->vision,
            'services'         => $profile->services,
            'technologies'     => $profile->technologies,
            'culture'          => $profile->culture,

            // Contact
            'official_email'   => $profile->official_email,
            'hr_email'         => $profile->hr_email,
            'phone'            => $profile->phone,
            'address'          => $profile->address,
            'linkedin_url'     => $profile->linkedin_url,
            'facebook_url'     => $profile->facebook_url,

            // Documents (URLs only — never expose raw paths)
            'business_cert_url'    => $profile->business_cert_url,
            'tax_docs_url'         => $profile->tax_docs_url,
            'verification_doc_url' => $profile->verification_doc_url,
            'hr_auth_url'          => $profile->hr_auth_url,

            'updated_at'       => $profile->updated_at,
        ];
    }

    /**
     * POST /api/company/profile/password
     * Change the company user's login password.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => [
                'required',
                'confirmed',
                Password::min(8)->mixedCase()->numbers(),
            ],
        ]);

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }
}