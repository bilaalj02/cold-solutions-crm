'use client'

import React, { useState, useEffect } from 'react';
import { EmailSequence, EmailTemplate, EmailSequenceStep } from '../lib/email-system';
import { SupabaseEmailManager } from '../lib/supabase-email';

interface SequenceModalProps {
  sequence?: EmailSequence | null;
  templates: EmailTemplate[];
  onSave: (sequenceData: any) => void;
  onClose: () => void;
}

export default function SequenceModal({ sequence, templates, onSave, onClose }: SequenceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: 'manual' as any,
    triggerConditions: {},
    isActive: true,
    steps: [] as EmailSequenceStep[]
  });

  useEffect(() => {
    if (sequence) {
      setFormData({
        name: sequence.name,
        description: sequence.description,
        trigger: sequence.trigger,
        triggerConditions: sequence.triggerConditions,
        isActive: sequence.isActive,
        steps: sequence.steps
      });
    } else {
      setFormData({
        name: '',
        description: '',
        trigger: 'manual',
        triggerConditions: {},
        isActive: true,
        steps: []
      });
    }
  }, [sequence]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const addStep = () => {
    const newStep: EmailSequenceStep = {
      id: `step-${Date.now()}`,
      order: formData.steps.length + 1,
      templateId: templates[0]?.id || '',
      delay: { value: 0, unit: 'days' },
      stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
    };
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const removeStep = (stepId: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== stepId).map((step, index) => ({
        ...step,
        order: index + 1
      }))
    }));
  };

  const updateStep = (stepId: string, updates: Partial<EmailSequenceStep>) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const stepIndex = formData.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    const newSteps = [...formData.steps];
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;

    if (targetIndex < 0 || targetIndex >= newSteps.length) return;

    [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]];

    setFormData(prev => ({
      ...prev,
      steps: newSteps.map((step, index) => ({
        ...step,
        order: index + 1
      }))
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.steps.length === 0) {
      alert('Please add at least one step to the sequence');
      return;
    }

    onSave(formData);
  };

  const triggerTypes = [
    { value: 'manual', label: 'Manual' },
    { value: 'lead-stage-change', label: 'Lead Stage Change' },
    { value: 'date-based', label: 'Date Based' },
    { value: 'lead-score', label: 'Lead Score' },
    { value: 'tag-added', label: 'Tag Added' }
  ];

  const delayUnits = [
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
            {sequence ? 'Edit Sequence' : 'Create New Sequence'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sequence Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                  placeholder="Enter sequence name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                  placeholder="Enter sequence description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger Type
                  </label>
                  <select
                    name="trigger"
                    value={formData.trigger}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                  >
                    {triggerTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#3dbff2] focus:ring-[#3dbff2] border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Active (sequence will run automatically)
                  </label>
                </div>
              </div>
            </div>

            {/* Sequence Steps */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium" style={{color: '#0a2240'}}>
                  Sequence Steps ({formData.steps.length})
                </h4>
                <button
                  type="button"
                  onClick={addStep}
                  disabled={templates.length === 0}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 disabled:opacity-50"
                  style={{backgroundColor: '#3dbff2'}}
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add Step
                </button>
              </div>

              {templates.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    You need to create email templates first before adding steps to a sequence.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {formData.steps.map((step, index) => (
                  <div key={step.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#3dbff2] text-white flex items-center justify-center text-sm font-bold">
                          {step.order}
                        </div>
                        <h5 className="font-medium">Step {step.order}</h5>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveStep(step.id, 'up')}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          title="Move up"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_upward</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStep(step.id, 'down')}
                          disabled={index === formData.steps.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          title="Move down"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_downward</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStep(step.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Remove step"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Template
                        </label>
                        <select
                          value={step.templateId}
                          onChange={(e) => updateStep(step.id, { templateId: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                        >
                          {templates.map(template => (
                            <option key={template.id} value={template.id}>
                              {template.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delay
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            value={step.delay.value}
                            onChange={(e) => updateStep(step.id, {
                              delay: { ...step.delay, value: parseInt(e.target.value) || 0 }
                            })}
                            className="w-20 rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                          />
                          <select
                            value={step.delay.unit}
                            onChange={(e) => updateStep(step.id, {
                              delay: { ...step.delay, unit: e.target.value as any }
                            })}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                          >
                            {delayUnits.map(unit => (
                              <option key={unit.value} value={unit.value}>
                                {unit.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {index > 0 && (
                      <div className="mt-3 text-xs text-gray-500">
                        Will be sent {step.delay.value} {step.delay.unit} after the previous step
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {formData.steps.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <span className="material-symbols-outlined text-gray-400 text-4xl">auto_awesome</span>
                  <p className="mt-2 text-sm text-gray-600">No steps added yet</p>
                  <p className="text-xs text-gray-500">Click "Add Step" to create your first sequence step</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90"
              style={{backgroundColor: '#3dbff2'}}
            >
              {sequence ? 'Update Sequence' : 'Create Sequence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
