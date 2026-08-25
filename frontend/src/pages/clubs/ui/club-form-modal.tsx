import { Form, Input, Modal, Select } from 'antd'
import { useEffect } from 'react'

import { CLUB_CATEGORY_OPTIONS } from '../shared/constants'
import type { ClubDetail, ClubStatus, ClubWritePayload } from '../shared/types'

type ClubFormValues = ClubWritePayload

type ClubFormModalProps = {
  allowStatus: boolean
  club?: ClubDetail | null
  isOpen: boolean
  isSubmitting: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  onSubmit: (payload: ClubWritePayload) => void
}

const statusOptions: { label: string; value: ClubStatus }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Disabled', value: 'disabled' }
]

function trimOptional(value?: string) {
  return value?.trim() || undefined
}

export default function ClubFormModal({
  allowStatus,
  club,
  isOpen,
  isSubmitting,
  mode,
  onClose,
  onSubmit
}: ClubFormModalProps) {
  const [form] = Form.useForm<ClubFormValues>()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (club) {
      form.setFieldsValue({
        category: club.category,
        contactEmail: club.contactEmail ?? undefined,
        contactPhone: club.contactPhone ?? undefined,
        coverImageUrl: club.coverImageUrl ?? undefined,
        description: club.description,
        facultyAdvisor: {
          department: club.facultyAdvisor.department,
          email: club.facultyAdvisor.email,
          name: club.facultyAdvisor.name
        },
        gallery: club.gallery,
        logoUrl: club.logoUrl ?? undefined,
        name: club.name,
        socialLinks: club.socialLinks,
        status: club.status
      })
      return
    }

    form.setFieldsValue({
      category: 'technology',
      facultyAdvisor: {
        name: ''
      },
      gallery: [],
      socialLinks: {},
      status: 'active'
    })
  }, [club, form, isOpen])

  const handleFinish = (values: ClubFormValues) => {
    onSubmit({
      category: values.category,
      contactEmail: trimOptional(values.contactEmail),
      contactPhone: trimOptional(values.contactPhone),
      coverImageUrl: trimOptional(values.coverImageUrl),
      description: values.description.trim(),
      facultyAdvisor: {
        department: trimOptional(values.facultyAdvisor.department),
        email: trimOptional(values.facultyAdvisor.email),
        name: values.facultyAdvisor.name.trim()
      },
      gallery: values.gallery ?? [],
      logoUrl: trimOptional(values.logoUrl),
      name: values.name.trim(),
      socialLinks: {
        facebook: trimOptional(values.socialLinks?.facebook),
        instagram: trimOptional(values.socialLinks?.instagram),
        linkedin: trimOptional(values.socialLinks?.linkedin),
        website: trimOptional(values.socialLinks?.website)
      },
      status: allowStatus ? values.status : undefined
    })
  }

  return (
    <Modal
      centered
      confirmLoading={isSubmitting}
      destroyOnClose
      okText={mode === 'create' ? 'Create Club' : 'Save Changes'}
      onCancel={onClose}
      onOk={() => form.submit()}
      open={isOpen}
      title={mode === 'create' ? 'Create Club' : 'Edit Club Details'}
      width="min(760px, calc(100vw - 32px))"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        preserve={false}
        requiredMark={false}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Form.Item label="Club Name" name="name" rules={[{ required: true }, { min: 3 }]}>
            <Input maxLength={120} />
          </Form.Item>

          <Form.Item label="Category" name="category" rules={[{ required: true }]}>
            <Select options={CLUB_CATEGORY_OPTIONS.filter(option => option.value !== 'all')} />
          </Form.Item>
        </div>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: 'Describe this club.' },
            { min: 20, message: 'Description must be at least 20 characters.' }
          ]}
        >
          <Input.TextArea autoSize={{ minRows: 4, maxRows: 7 }} maxLength={3000} showCount />
        </Form.Item>

        <div className="grid gap-3 md:grid-cols-3">
          <Form.Item
            label="Advisor"
            name={['facultyAdvisor', 'name']}
            rules={[{ required: true, message: 'Advisor name is required.' }]}
          >
            <Input maxLength={120} />
          </Form.Item>

          <Form.Item label="Advisor Department" name={['facultyAdvisor', 'department']}>
            <Input maxLength={120} />
          </Form.Item>

          <Form.Item
            label="Advisor Email"
            name={['facultyAdvisor', 'email']}
            rules={[{ type: 'email', message: 'Use a valid email.' }]}
          >
            <Input maxLength={160} />
          </Form.Item>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Form.Item
            label="Contact Email"
            name="contactEmail"
            rules={[{ type: 'email', message: 'Use a valid email.' }]}
          >
            <Input maxLength={160} />
          </Form.Item>

          <Form.Item label="Contact Phone" name="contactPhone">
            <Input maxLength={40} />
          </Form.Item>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Form.Item label="Logo URL" name="logoUrl" rules={[{ type: 'url' }]}>
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item label="Cover Image URL" name="coverImageUrl" rules={[{ type: 'url' }]}>
            <Input placeholder="https://..." />
          </Form.Item>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Form.Item label="Website" name={['socialLinks', 'website']} rules={[{ type: 'url' }]}>
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item
            label="Instagram"
            name={['socialLinks', 'instagram']}
            rules={[{ type: 'url' }]}
          >
            <Input placeholder="https://..." />
          </Form.Item>
        </div>

        {allowStatus ? (
          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select options={statusOptions} />
          </Form.Item>
        ) : null}
      </Form>
    </Modal>
  )
}
