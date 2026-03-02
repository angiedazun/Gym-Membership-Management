import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import StatusBadge from '../components/StatusBadge'
import { ArrowLeft, Pencil, Phone, Mail, MapPin, User, Calendar, Shield } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const API_URL = 'http://localhost:5000'

export default function MemberProfile() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [member,   setMember]   = useState(null)
  const [payments, setPayments] = useState([])
  const [attend,   setAttend]   = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/members/${id}`),
      api.get('/payments', { params: { memberId: id, limit: 20 } }),
      api.get('/attendance', { params: { limit: 15 } }),
    ]).then(([m, p, a]) => {
      setMember(m.data.member)
      setPayments(p.data.payments || [])
      // filter attendance for this member
      setAttend((a.data.records || []).filter((r) => r.member?._id === id))
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [id])

  const downloadMemberCard = () => {
    if (!member) return
    const doc = new jsPDF({ unit: 'mm', format: [85.6, 54] }) // credit card size

    // Background
    doc.setFillColor(9, 9, 11)
    doc.rect(0, 0, 85.6, 54, 'F')

    // Red header bar
    doc.setFillColor(225, 29, 72)
    doc.rect(0, 0, 85.6, 14, 'F')

    // Header text
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8); doc.setFont('helvetica', 'bold')
    doc.text('COMBAT FITNESS', 4, 6)
    doc.setFontSize(6); doc.setFont('helvetica', 'normal')
    doc.text('MEMBER CARD', 4, 11)

    // Member details (left side)
    doc.setFontSize(11); doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(member.name, 4, 22)
    doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    doc.setTextColor(180, 180, 180)
    doc.text(`ID: ${member.memberId}`, 4, 28)
    doc.text(`Plan: ${member.plan?.name || '—'}`, 4, 33)
    doc.text(`Expires: ${member.membershipExpiry ? format(new Date(member.membershipExpiry), 'dd MMM yyyy') : '—'}`, 4, 38)
    doc.text(`Status: ${member.status?.toUpperCase()}`, 4, 43)

    // QR code (right side) — use stored data URL from backend
    if (member.qrCode) {
      doc.addImage(member.qrCode, 'PNG', 58, 17, 24, 24)
      doc.setFontSize(5); doc.setTextColor(120, 120, 120)
      doc.text('Scan to check in', 62, 44)
    }

    doc.save(`member-card-${member.memberId}.pdf`)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!member) return (
    <div className="text-center py-20 text-zinc-500">Member not found.</div>
  )

  const daysLeft = member.membershipExpiry
    ? differenceInDays(new Date(member.membershipExpiry), new Date())
    : null

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/members')} className="btn-secondary p-2">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-black text-white">Member Profile</h2>
          <p className="text-xs text-zinc-500">{member.memberId}</p>
        </div>
        <Link to={`/members/${id}/edit`} className="btn-secondary gap-2">
          <Pencil size={14} /> Edit
        </Link>
        <button onClick={downloadMemberCard} className="btn-primary gap-2">
          Download Card
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Photo + identity */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card flex flex-col items-center gap-4 text-center">
          {member.profilePhoto ? (
            <img src={`${API_URL}${member.profilePhoto}`} alt={member.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-red-600" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-red-600 to-rose-800 flex items-center justify-center text-4xl font-black text-white border-4 border-zinc-700">
              {member.name[0]}
            </div>
          )}
          <div>
            <h3 className="text-lg font-black text-white">{member.name}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{member.memberId}</p>
            <div className="mt-2"><StatusBadge status={member.status} /></div>
          </div>

          {/* Expiry indicator */}
          {daysLeft !== null && (
            <div className={`w-full p-3 rounded-xl border text-center ${
              daysLeft < 0 ? 'bg-red-950/40 border-red-900 text-red-400' :
              daysLeft <= 7 ? 'bg-amber-950/40 border-amber-900 text-amber-400' :
              'bg-emerald-950/40 border-emerald-900 text-emerald-400'
            }`}>
              <p className="text-xs font-medium">
                {daysLeft < 0 ? `Expired ${Math.abs(daysLeft)} day(s) ago` :
                 daysLeft === 0 ? 'Expires today!' :
                 `${daysLeft} day(s) remaining`}
              </p>
            </div>
          )}

          {/* QR Code */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Check-in QR</p>
            <div className="p-3 bg-white rounded-xl">
              <QRCodeSVG value={member._id} size={100} />
            </div>
            <p className="text-xs text-zinc-600">Scan at attendance</p>
          </div>
        </motion.div>

        {/* Right: Details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-5">

          {/* Contact Details */}
          <div className="card space-y-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={Phone} label="Phone" value={member.phone} />
              <InfoRow icon={Mail} label="Email" value={member.email || '—'} />
              <InfoRow icon={MapPin} label="Address" value={member.address || '—'} />
              <InfoRow icon={User} label="Gender" value={member.gender} className="capitalize" />
              <InfoRow icon={Calendar} label="Date of Birth"
                value={member.dateOfBirth ? format(new Date(member.dateOfBirth), 'dd MMM yyyy') : '—'} />
            </div>
          </div>

          {/* Membership Details */}
          <div className="card space-y-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Membership</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={Shield} label="Plan" value={member.plan?.name || '—'} />
              <InfoRow icon={User} label="Trainer" value={member.trainer?.name || 'Not assigned'} />
              <InfoRow icon={Calendar} label="Start Date"
                value={member.membershipStart ? format(new Date(member.membershipStart), 'dd MMM yyyy') : '—'} />
              <InfoRow icon={Calendar} label="Expiry Date"
                value={member.membershipExpiry ? format(new Date(member.membershipExpiry), 'dd MMM yyyy') : '—'} />
            </div>
          </div>

          {/* Emergency Contact */}
          {member.emergencyContact?.name && (
            <div className="card space-y-3">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Emergency Contact</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <InfoRow icon={User}  label="Name"     value={member.emergencyContact.name} />
                <InfoRow icon={Phone} label="Phone"    value={member.emergencyContact.phone} />
                <InfoRow icon={User}  label="Relation" value={member.emergencyContact.relation} />
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Payment History */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card">
        <h4 className="text-sm font-bold text-zinc-100 mb-4">Payment History</h4>
        {payments.length === 0 ? (
          <p className="text-sm text-zinc-500 py-4 text-center">No payments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-head">
                  {['Pay ID','Plan','Amount','Method','Date','Valid Until','Status'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="table-row">
                    <td className="table-cell font-mono text-xs text-zinc-500">{p.paymentId}</td>
                    <td className="table-cell text-zinc-300">{p.plan?.name}</td>
                    <td className="table-cell text-emerald-400 font-semibold">LKR {p.finalAmount?.toLocaleString()}</td>
                    <td className="table-cell capitalize text-zinc-400">{p.method}</td>
                    <td className="table-cell text-zinc-400 text-xs">{p.paymentDate ? format(new Date(p.paymentDate), 'dd MMM yyyy') : '—'}</td>
                    <td className="table-cell text-zinc-400 text-xs">{p.validTo ? format(new Date(p.validTo), 'dd MMM yyyy') : '—'}</td>
                    <td className="table-cell"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, className = '' }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-red-400" />
      </div>
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className={`text-sm text-zinc-100 font-medium ${className}`}>{value}</p>
      </div>
    </div>
  )
}
