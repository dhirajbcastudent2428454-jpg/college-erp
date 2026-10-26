import { api, setMessage } from './api.js';
const form=document.querySelector('#otp-form');const message=document.querySelector('#otp-message');const challengeId=sessionStorage.getItem('erp_challenge_id');const debugOtp=sessionStorage.getItem('erp_debug_otp');
if(debugOtp)message.textContent=`Development-only OTP: ${debugOtp}`;
if(!challengeId)setMessage(message,'Your verification request has expired. Please sign in again.');
form?.addEventListener('submit',async(event)=>{event.preventDefault();if(!challengeId)return;const button=form.querySelector('button[type="submit"]');button.disabled=true;button.textContent='Verifying…';try{await api('/auth/otp/verify',{method:'POST',body:{challengeId,otp:form.otp.value.trim()}});sessionStorage.removeItem('erp_challenge_id');sessionStorage.removeItem('erp_debug_otp');window.location.href='/dashboard.html'}catch(error){setMessage(message,error.message)}finally{button.disabled=false;button.textContent='Verify and enter'}});
document.querySelector('#resend')?.addEventListener('click',()=>{setMessage(message,'For security, start a new sign-in to request another code.','info');});
