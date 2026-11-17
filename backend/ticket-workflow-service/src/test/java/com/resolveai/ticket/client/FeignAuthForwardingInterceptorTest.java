package com.resolveai.ticket.client;
import feign.RequestTemplate;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import static org.assertj.core.api.Assertions.assertThat;
class FeignAuthForwardingInterceptorTest {
 @AfterEach void clear(){RequestContextHolder.resetRequestAttributes();}
 @Test void copiesAuthorizationWhenServletRequestExists(){MockHttpServletRequest req=new MockHttpServletRequest();req.addHeader("Authorization","Bearer test-token");RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(req));RequestTemplate template=new RequestTemplate();new FeignAuthForwardingInterceptor().apply(template);assertThat(template.headers().get("Authorization")).containsExactly("Bearer test-token");}
 @Test void doesNothingWithoutCurrentRequest(){RequestContextHolder.resetRequestAttributes();RequestTemplate template=new RequestTemplate();new FeignAuthForwardingInterceptor().apply(template);assertThat(template.headers()).doesNotContainKey("Authorization");}
}
