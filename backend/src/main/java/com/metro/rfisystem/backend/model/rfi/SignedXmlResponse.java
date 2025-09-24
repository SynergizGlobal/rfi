package com.metro.rfisystem.backend.model.rfi;
public class SignedXmlResponse {
    private String signedXmlRequest;
    private String txnId;

    public SignedXmlResponse() {}

    public SignedXmlResponse(String signedXmlRequest, String txnId) {
        this.signedXmlRequest = signedXmlRequest;
        this.txnId = txnId;
    }

    public String getSignedXmlRequest() {
        return signedXmlRequest;
    }

    public void setSignedXmlRequest(String signedXmlRequest) {
        this.signedXmlRequest = signedXmlRequest;
    }

    public String getTxnId() {
        return txnId;
    }

    public void setTxnId(String txnId) {
        this.txnId = txnId;
    }
}

