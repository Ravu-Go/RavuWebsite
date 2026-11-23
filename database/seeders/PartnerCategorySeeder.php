<?php

namespace Database\Seeders;

use App\Models\DocumentRequirement;
use App\Models\PartnerCategory;
use Illuminate\Database\Seeder;

class PartnerCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Fuel Stations' => 'fuel-stations',
            'Motorcycle Workshops' => 'motorcycle-workshops',
            'Vehicle Workshops' => 'vehicle-workshops',
            'Spare Parts Dealers' => 'spare-parts-dealers',
            'Insurance Providers' => 'insurance-providers',
            'Financial Institutions' => 'financial-institutions',
            'Vehicle Dealerships' => 'vehicle-dealerships',
            'Retail Businesses' => 'retail-businesses',
            'Healthcare Providers' => 'healthcare-providers',
            'Other Services' => 'other-services',
        ];

        foreach ($categories as $name => $slug) {
            PartnerCategory::firstOrCreate(['slug' => $slug], ['name' => $name, 'is_active' => true]);
        }

        $requirements = [
            ['document_type' => 'tin_certificate', 'label' => 'TIN certificate', 'description' => 'Tax identification document for the business.', 'requires_expiry_date' => false],
            ['document_type' => 'business_registration_certificate', 'label' => 'Business registration certificate', 'description' => 'Certificate or record showing the business registration.', 'requires_expiry_date' => false],
            ['document_type' => 'business_license', 'label' => 'Valid business license', 'description' => 'Current operating license, where applicable.', 'requires_expiry_date' => true],
        ];

        foreach ($requirements as $requirement) {
            DocumentRequirement::firstOrCreate(
                ['partner_category_id' => null, 'document_type' => $requirement['document_type']],
                [...$requirement, 'is_required' => true, 'is_active' => true],
            );
        }
    }
}
