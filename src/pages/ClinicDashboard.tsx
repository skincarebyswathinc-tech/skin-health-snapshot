import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';

interface Clinic {
  id: string;
  clinic_name: string;
  subscription_plan: string;
  max_patients: number;
}

interface Patient {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_user_id: string;
  notes: string | null;
  added_at: string;
}

export default function ClinicDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    loadClinic();
  }, [user]);

  const loadClinic = async () => {
    const { data: clinics } = await supabase
      .from('clinic_accounts')
      .select('*')
      .eq('admin_user_id', user!.id)
      .limit(1);

    if (!clinics || clinics.length === 0) {
      navigate('/clinic/register');
      return;
    }

    const c = clinics[0] as Clinic;
    setClinic(c);
    await loadPatients(c.id);
    setLoading(false);
  };

  const loadPatients = async (clinicId: string) => {
    const { data } = await supabase
      .from('clinic_patients')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('added_at', { ascending: false });
    setPatients((data as Patient[]) || []);
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic) return;
    setAddError('');
    setAdding(true);
    try {
      // Look up user by email — we'll store a placeholder UUID if not found yet
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', (await supabase.rpc('', {})).data) // We can't look up by email via profiles
        .limit(1);

      // For linked users, we store the email and a nil UUID initially
      // The patient_user_id will be updated when they accept the invite
      const { error } = await supabase.from('clinic_patients').insert({
        clinic_id: clinic.id,
        patient_name: newName,
        patient_email: newEmail,
        patient_user_id: '00000000-0000-0000-0000-000000000000', // placeholder until linked
        notes: null,
      });
      if (error) throw error;

      setNewName('');
      setNewEmail('');
      setShowAdd(false);
      await loadPatients(clinic.id);
    } catch (err: any) {
      setAddError(err.message || 'Failed to add patient');
    } finally {
      setAdding(false);
    }
  };

  const handleRemovePatient = async (patientId: string) => {
    if (!clinic) return;
    await supabase.from('clinic_patients').delete().eq('id', patientId);
    await loadPatients(clinic.id);
  };

  const filtered = patients.filter(
    (p) =>
      p.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      p.patient_email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <AppLayout onSignOut={signOut}>
        <div className="page-container flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground">Loading clinic...</div>
        </div>
      </AppLayout>
    );
  }

  const planInfo = clinic?.subscription_plan === 'pro'
    ? { label: 'Pro', price: '$299/mo', color: 'hsl(var(--accent))' }
    : { label: 'Starter', price: '$99/mo', color: 'hsl(var(--teal))' };

  return (
    <AppLayout onSignOut={signOut}>
      <div className="page-container max-w-5xl">
        <PageHeader
          title={clinic?.clinic_name || 'Clinic Dashboard'}
          subtitle="Manage patients and track skin progress"
        />

        {/* Stats Row */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3 fade-in stagger-1">
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-semibold text-foreground">{patients.length}</p>
            <p className="text-micro text-muted-foreground mt-1">Total Patients</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-semibold" style={{ color: planInfo.color }}>{planInfo.label}</p>
            <p className="text-micro text-muted-foreground mt-1">{planInfo.price}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-semibold text-foreground">{clinic?.max_patients}</p>
            <p className="text-micro text-muted-foreground mt-1">Patient Limit</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 fade-in stagger-2">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="input-field pl-10"
            />
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Patient
          </button>
          <button onClick={() => navigate('/clinic/billing')} className="btn-secondary">
            Manage Plan
          </button>
        </div>

        {/* Add Patient Form */}
        {showAdd && (
          <div className="glass-panel mb-6 fade-in">
            <h3 className="text-card-title mb-4">Add New Patient</h3>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-micro font-medium text-muted-foreground">Patient Name</label>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="input-field" required placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="mb-1.5 block text-micro font-medium text-muted-foreground">Patient Email</label>
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="input-field" required placeholder="jane@example.com" />
                </div>
              </div>
              {addError && (
                <div className="rounded-xl p-3 text-micro" style={{ background: 'hsl(var(--destructive) / 0.08)', color: 'hsl(var(--destructive))' }}>
                  {addError}
                </div>
              )}
              <div className="flex gap-3">
                <button type="submit" disabled={adding} className="btn-primary disabled:opacity-50">
                  {adding ? 'Adding...' : 'Add Patient'}
                </button>
                <button type="button" onClick={() => { setShowAdd(false); setAddError(''); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Patient List */}
        <div className="fade-in stagger-3">
          {filtered.length === 0 ? (
            <div className="glass-panel text-center py-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2.25 2.25 0 013 16.878v-.003c0-1.113.285-2.16.786-3.07M15 19.128H5.228M8.228 16.055A4.5 4.5 0 0112 13.5a4.5 4.5 0 013.772 2.555M8.228 16.055L8.228 16.055M12 10.5a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              </div>
              <p className="text-card-title mb-1">No patients yet</p>
              <p className="text-micro text-muted-foreground">Add your first patient to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((patient) => (
                <div key={patient.id} className="glass-card flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {patient.patient_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-card-title">{patient.patient_name}</p>
                      <p className="text-micro text-muted-foreground">{patient.patient_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-micro text-muted-foreground hidden sm:inline">
                      Added {new Date(patient.added_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleRemovePatient(patient.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove patient"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
