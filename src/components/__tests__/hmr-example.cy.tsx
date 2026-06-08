describe('HMR验证测试', () => {
  it('should verify HMR is configured', () => {
    // 检查webpack HMR相关的API是否存在
    cy.window().then((win) => {
      expect(win).to.have.property('webpackHotUpdate');
    });
    
    // 检查HotModuleReplacementPlugin是否启用
    cy.window().then((win) => {
      if (win.module && win.module.hot) {
        expect(win.module.hot).to.exist;
        expect(typeof win.module.hot.accept).to.equal('function');
      }
    });
  });
});
