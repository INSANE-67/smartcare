-- Migration: 007_medical_records_crud.sql
-- Adds RLS policies for Medical Records CRUD operations.

-- 1. Patients can UPDATE their own medical records
CREATE POLICY "Patients can update own medical records"
  ON public.medical_records
  FOR UPDATE
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- 2. Patients can DELETE their own medical records
CREATE POLICY "Patients can delete own medical records"
  ON public.medical_records
  FOR DELETE
  USING (auth.uid() = patient_id);

-- 3. Doctors can INSERT medical records if there is an active relationship
CREATE POLICY "Doctors can insert patient records with active relationship"
  ON public.medical_records
  FOR INSERT
  WITH CHECK (
    auth.uid() = doctor_id 
    AND EXISTS (
      SELECT 1 FROM public.doctor_patient_relationships dpr
      WHERE dpr.doctor_id = auth.uid()
        AND dpr.patient_id = medical_records.patient_id
        AND dpr.status = 'active'
    )
  );

-- 4. Doctors can UPDATE medical records they created if there is an active relationship
CREATE POLICY "Doctors can update records they created with active relationship"
  ON public.medical_records
  FOR UPDATE
  USING (
    auth.uid() = doctor_id
    AND EXISTS (
      SELECT 1 FROM public.doctor_patient_relationships dpr
      WHERE dpr.doctor_id = auth.uid()
        AND dpr.patient_id = medical_records.patient_id
        AND dpr.status = 'active'
    )
  )
  WITH CHECK (
    auth.uid() = doctor_id
    AND EXISTS (
      SELECT 1 FROM public.doctor_patient_relationships dpr
      WHERE dpr.doctor_id = auth.uid()
        AND dpr.patient_id = medical_records.patient_id
        AND dpr.status = 'active'
    )
  );

-- Note: Doctors are NOT allowed to DELETE medical records, as per specification.
