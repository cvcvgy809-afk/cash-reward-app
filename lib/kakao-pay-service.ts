/**
 * 카카오페이 결제 서비스 (실제 결제)
 * 카카오페이 API를 통한 실제 결제 처리
 */

const KAKAO_APP_ID = process.env.KAKAO_APP_ID || "1470706";
const KAKAO_MERCHANT_ID = process.env.KAKAO_MERCHANT_ID || "kartracerapp-fxgtpp9z.manus.space";
const KAKAO_ADMIN_KEY = process.env.KAKAO_ADMIN_KEY || "";

const KAKAO_API_BASE = "https://kapi.kakao.com";

export interface PaymentRequest {
  orderId: string;
  itemName: string;
  quantity: number;
  totalAmount: number;
  taxFreeAmount?: number;
  approvalUrl: string;
  cancelUrl: string;
  failUrl: string;
}

export interface PaymentResponse {
  tid: string;
  next_redirect_pc_url: string;
  next_redirect_mobile_url: string;
  next_redirect_app_url: string;
  created_at: string;
}

export interface ApprovalResponse {
  tid: string;
  aid: string;
  partner_order_id: string;
  partner_user_id: string;
  payment_method_type: string;
  item_name: string;
  item_code: string;
  quantity: number;
  amount: {
    total: number;
    tax_free: number;
    vat: number;
    point: number;
    discount: number;
    green_deposit: number;
  };
  created_at: string;
  approved_at: string;
}

/**
 * 카카오페이 결제 준비
 */
export const initializePayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  try {
    if (!KAKAO_ADMIN_KEY) {
      throw new Error("카카오페이 Admin 키가 설정되지 않았습니다.");
    }

    const params = new URLSearchParams();
    params.append("cid", KAKAO_MERCHANT_ID);
    params.append("partner_order_id", request.orderId);
    params.append("partner_user_id", "cashbox_user");
    params.append("item_name", request.itemName);
    params.append("quantity", request.quantity.toString());
    params.append("total_amount", request.totalAmount.toString());
    params.append("tax_free_amount", (request.taxFreeAmount || 0).toString());
    params.append("approval_url", request.approvalUrl);
    params.append("cancel_url", request.cancelUrl);
    params.append("fail_url", request.failUrl);

    const response = await fetch(`${KAKAO_API_BASE}/v1/payment/ready`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `KakaoAK ${KAKAO_ADMIN_KEY}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("카카오페이 API 오류:", error);
      throw new Error(`카카오페이 결제 준비 실패: ${error.msg || error.error_description}`);
    }

    const data: PaymentResponse = await response.json();
    return data;
  } catch (error) {
    console.error("카카오페이 결제 준비 오류:", error);
    throw error;
  }
};

/**
 * 카카오페이 결제 승인
 */
export const approvePayment = async (
  tid: string,
  pgToken: string,
  orderId: string
): Promise<ApprovalResponse> => {
  try {
    if (!KAKAO_ADMIN_KEY) {
      throw new Error("카카오페이 Admin 키가 설정되지 않았습니다.");
    }

    const params = new URLSearchParams();
    params.append("cid", KAKAO_MERCHANT_ID);
    params.append("tid", tid);
    params.append("partner_order_id", orderId);
    params.append("partner_user_id", "cashbox_user");
    params.append("pg_token", pgToken);

    const response = await fetch(`${KAKAO_API_BASE}/v1/payment/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `KakaoAK ${KAKAO_ADMIN_KEY}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("카카오페이 API 오류:", error);
      throw new Error(`카카오페이 결제 승인 실패: ${error.msg || error.error_description}`);
    }

    const data: ApprovalResponse = await response.json();
    return data;
  } catch (error) {
    console.error("카카오페이 결제 승인 오류:", error);
    throw error;
  }
};

/**
 * 카카오페이 결제 취소
 */
export const cancelPayment = async (tid: string, cancelAmount?: number): Promise<any> => {
  try {
    if (!KAKAO_ADMIN_KEY) {
      throw new Error("카카오페이 Admin 키가 설정되지 않았습니다.");
    }

    const params = new URLSearchParams();
    params.append("cid", KAKAO_MERCHANT_ID);
    params.append("tid", tid);
    if (cancelAmount) {
      params.append("cancel_amount", cancelAmount.toString());
    }

    const response = await fetch(`${KAKAO_API_BASE}/v1/payment/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `KakaoAK ${KAKAO_ADMIN_KEY}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("카카오페이 API 오류:", error);
      throw new Error(`카카오페이 결제 취소 실패: ${error.msg || error.error_description}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("카카오페이 결제 취소 오류:", error);
    throw error;
  }
};

/**
 * 카카오페이 결제 정보 조회
 */
export const getPaymentInfo = async (tid: string): Promise<any> => {
  try {
    if (!KAKAO_ADMIN_KEY) {
      throw new Error("카카오페이 Admin 키가 설정되지 않았습니다.");
    }

    const params = new URLSearchParams();
    params.append("cid", KAKAO_MERCHANT_ID);
    params.append("tid", tid);

    const response = await fetch(`${KAKAO_API_BASE}/v1/payment/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `KakaoAK ${KAKAO_ADMIN_KEY}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("카카오페이 API 오류:", error);
      throw new Error(`카카오페이 결제 정보 조회 실패: ${error.msg || error.error_description}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("카카오페이 결제 정보 조회 오류:", error);
    throw error;
  }
};
