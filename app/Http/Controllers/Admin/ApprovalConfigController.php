<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApprovalConfig;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApprovalConfigController extends Controller
{
    public function index()
    {
        $configs = ApprovalConfig::orderBy('module_key')->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'module_key' => $c->module_key,
                'label' => $c->label,
                'steps' => $c->steps,
                'is_active' => $c->is_active,
                'updated_by' => $c->updated_by,
                'updated_at' => $c->updated_at?->format('d M Y H:i'),
            ];
        });

        return Inertia::render('Admin/Approval/Index', [
            'configs' => $configs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'module_key' => 'required|string|unique:approval_config,module_key',
            'label' => 'required|string|max:255',
            'steps' => 'required|array|min:1',
            'steps.*.step' => 'required|string',
            'steps.*.label' => 'required|string',
            'steps.*.role' => 'required|string',
            'steps.*.required' => 'required|boolean',
            'is_active' => 'boolean',
        ]);

        $validated['updated_by'] = auth()->id();
        $validated['is_active'] = $validated['is_active'] ?? true;

        ApprovalConfig::create($validated);

        return redirect()->back()->with('success', 'Approval config berhasil ditambahkan.');
    }

    public function update(Request $request, string $id)
    {
        $config = ApprovalConfig::findOrFail($id);

        $validated = $request->validate([
            'module_key' => 'required|string|unique:approval_config,module_key,' . $id,
            'label' => 'required|string|max:255',
            'steps' => 'required|array|min:1',
            'steps.*.step' => 'required|string',
            'steps.*.label' => 'required|string',
            'steps.*.role' => 'required|string',
            'steps.*.required' => 'required|boolean',
            'is_active' => 'boolean',
        ]);

        $validated['updated_by'] = auth()->id();

        $config->update($validated);

        return redirect()->back()->with('success', 'Approval config berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        $config = ApprovalConfig::findOrFail($id);
        $config->delete();

        return redirect()->back()->with('success', 'Approval config berhasil dihapus.');
    }
}